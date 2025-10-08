# backend/app/services/prediction_service.py

import pandas as pd
import joblib
import json
from typing import Dict, Any, List

# Importa as configurações e schemas que criamos
from app.core.config import settings
from app.models.prediction_schema import AnalysisResult, PredictionRow

# Importa as funções de pré-processamento
from app.ml import preprocessing

class PredictionService:
    def __init__(self):
        """
        Carrega todos os artefatos de ML na memória quando o serviço é inicializado.
        """
        try:
            print("Carregando artefatos de Machine Learning para o serviço...")
            
            artifacts_path = settings.ML_ARTIFACTS_PATH
            
            with open(artifacts_path / "colunas_info.json", "r") as f:
                self.colunas_info = json.load(f)

            imputers_dict = joblib.load(artifacts_path / "imputadores.pkl")
            self.imputador_numerico = imputers_dict['mediana_num']
            self.imputador_categorico = imputers_dict['moda_cat']
            
            self.scaler = joblib.load(artifacts_path / "standard_scaler.pkl")
            self.kmeans_model = joblib.load(artifacts_path / "kmeans_model.pkl")
            
            # <-- MUDANÇA AQUI: Carregando o modelo Random Forest em vez do SVR
            self.prediction_model = joblib.load(artifacts_path / "model_randomforest.pkl")
            
            self.features_para_modelo = joblib.load(artifacts_path / "features_list.pkl")

            print("Artefatos carregados com sucesso!")

        except FileNotFoundError as e:
            print(f"Erro crítico: Arquivo de modelo não encontrado: {e}")
            print("A API não poderá realizar predições. Verifique se os artefatos estão na pasta app/ml/.")
            raise e

    def execute_prediction_pipeline(self, df: pd.DataFrame) -> AnalysisResult:
        """
        Orquestra e executa a pipeline completa de predição.
        """
        df_original = df.copy()
        total_rows = len(df)
        
        # --- PASSO 1: Limpeza e Engenharia de Features ---
        print("Iniciando Passo 1: Limpeza e Engenharia de Features...")
        colunas_para_remover = [
            'F0299 - Explicação Tempo', 'PTempoTotalExpl', 'T1199Expl',
            'T1205Expl', 'T0499 - Explicação Tempo', 'T1210Expl',
            'TempoTotalExpl', 'Q1202', 'Q1203', 'Q1207'
        ]
        colunas_de_cor_hex = ['F0207']
        coluna_de_data = 'Data/Hora Último'

        df_processado = preprocessing.remover_colunas_indesejadas(df, colunas_para_remover)
        df_processado = preprocessing.engenharia_features_cor(df_processado, colunas_de_cor_hex)
        df_processado = preprocessing.converter_data_para_timestamp(df_processado, coluna_de_data)
        df_processado.replace(-1, pd.NA, inplace=True)
        
        # --- PASSO 2: Imputação ---
        print("Iniciando Passo 2: Imputação de Valores Ausentes...")
        col_num = self.colunas_info['colunas_numericas']
        col_cat = self.colunas_info['colunas_categoricas']
        
        col_num_existentes = [c for c in col_num if c in df_processado.columns]
        col_cat_existentes = [c for c in col_cat if c in df_processado.columns]
        
        df_processado[col_num_existentes] = self.imputador_numerico.transform(df_processado[col_num_existentes])
        df_processado[col_cat_existentes] = self.imputador_categorico.transform(df_processado[col_cat_existentes])
        
        # <-- MUDANÇA AQUI: Lógica da Pipeline ajustada
        
        # --- PASSO 3: Padronização (APENAS PARA CLUSTERIZAÇÃO) ---
        print("Iniciando Passo 3: Padronização (apenas para clusterização)...")
        # Criamos um DataFrame temporário com os dados padronizados
        df_padronizado_para_cluster = df_processado.copy()
        df_padronizado_para_cluster[col_num_existentes] = self.scaler.transform(df_processado[col_num_existentes])

        # --- PASSO 4: Atribuição de Cluster ---
        print("Iniciando Passo 4: Atribuição de Cluster...")
        # A clusterização usa os dados padronizados
        clusters = self.kmeans_model.predict(df_padronizado_para_cluster[col_num_existentes])
        
        # O resultado do cluster é adicionado ao DataFrame NÃO padronizado
        df_processado['Cluster'] = clusters
        
        # --- PASSO 5: Predição com Random Forest (usando dados NÃO padronizados) ---
        print("Iniciando Passo 5: Predição com Modelo Random Forest...")
        # Garante a ordem correta das colunas para o modelo
        df_final_para_predicao = df_processado[self.features_para_modelo]
        
        # O modelo Random Forest espera um dicionário com um regressor para cada target
        pred_target1 = self.prediction_model['Target1'].predict(df_final_para_predicao)
        pred_target2 = self.prediction_model['Target2'].predict(df_final_para_predicao)
        pred_target3 = self.prediction_model['Target3'].predict(df_final_para_predicao)
        
        # --- FORMATANDO A SAÍDA ---
        print("Formatando o resultado final...")
        
        df_original['Cluster'] = clusters
        df_original['Target1_Pred'] = pred_target1
        df_original['Target2_Pred'] = pred_target2
        df_original['Target3_Pred'] = pred_target3
        
        prediction_rows = []
        for _, row in df_original.iterrows():
            prediction_rows.append(
                PredictionRow(
                    Cluster=row['Cluster'],
                    Target1_Pred=row['Target1_Pred'],
                    Target2_Pred=row['Target2_Pred'],
                    Target3_Pred=row['Target3_Pred'],
                    original_data=row.drop(['Cluster', 'Target1_Pred', 'Target2_Pred', 'Target3_Pred']).to_dict()
                )
            )
        
        return AnalysisResult(
            total_rows=total_rows,
            processed_rows=len(df_original),
            predictions=prediction_rows
        )

# Cria a instância única do serviço
prediction_service = PredictionService()