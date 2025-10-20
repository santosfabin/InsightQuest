# backend/app/services/prediction_service.py

import pandas as pd
import joblib
import pickle
import json
import numpy as np
from typing import Dict, Any

# Importa as configurações e schemas
from app.core.config import settings
from app.models.prediction_schema import AnalysisResult, PredictionRow
# Importa as funções de pré-processamento e engenharia de features
from app.ml import preprocessing, feature_engineering # <-- Adicionado feature_engineering

class PredictionService:
    def __init__(self):
        """ Carrega todos os novos artefatos de ML (V2) """
        try:
            print("Carregando artefatos de Machine Learning (V2) para o serviço...")
            artifacts_path = settings.ML_ARTIFACTS_PATH
            prediction_artifacts_path = artifacts_path / "artefazos_predicao"

            # 1. Genérico
            with open(artifacts_path / "generic_preprocessing_artifacts.pkl", "rb") as f:
                generic_artifacts = pickle.load(f)
            self.numeric_medians = generic_artifacts.get('numeric_medians', {})
            self.categorical_modes = generic_artifacts.get('categorical_modes', {})
            self.date_min = generic_artifacts.get('date_min')
            print("✅ 'generic_preprocessing_artifacts.pkl' carregado.")

            # 2. Configuração Colunas
            with open(artifacts_path / "coluns.json", "r", encoding='utf-8') as f:
                self.coluns_json = json.load(f)
            print("✅ 'coluns.json' carregado.")

            # 3. Clusterização
            with open(artifacts_path / "clustering_artifacts_v2.pkl", "rb") as f:
                cluster_artifacts = pickle.load(f)
            self.cluster_scaler = cluster_artifacts.get('scaler')
            self.cluster_model = cluster_artifacts.get('model')
            self.cluster_features = cluster_artifacts.get('features', [])
            print("✅ 'clustering_artifacts_v2.pkl' carregado.")

            # 4. Predição por Target
            self.targets = ['Target1', 'Target2', 'Target3']
            self.target_features = {}
            self.target_scalers = {}
            self.target_models = {}
            for target in self.targets:
                features_path = prediction_artifacts_path / f'lista_features_{target}.joblib'
                self.target_features[target] = joblib.load(features_path)
                scaler_path = prediction_artifacts_path / f'scaler_{target}.joblib'
                self.target_scalers[target] = joblib.load(scaler_path)
                model_path = prediction_artifacts_path / f'modelo_final_{target}.joblib'
                self.target_models[target] = joblib.load(model_path)
            print(f"✅ Artefatos de predição para {len(self.targets)} targets carregados.")
            print("-" * 50)
            print("Artefatos (V2) carregados com sucesso!")
            print("-" * 50)
        except FileNotFoundError as e:
            print(f"❌ Erro crítico: Arquivo de modelo não encontrado: {e}")
            raise e
        except Exception as e:
            print(f"❌ Erro inesperado ao carregar os artefatos: {e}")
            raise e

    def execute_prediction_pipeline(self, df: pd.DataFrame) -> AnalysisResult:
        """ Executa a pipeline completa V2 conforme o notebook. """
        print("\n🚀 Iniciando Pipeline de Predição V2...")
        df_pipeline = df.copy()
        df_original_para_retorno = df.copy() # Salva o original para o output
        total_rows = len(df_pipeline)

        # === Bloco 3: Tratamento Inicial ===
        print("➡️ Bloco 3: Tratamento Inicial...")
        if 'Código de Acesso' in df_pipeline.columns:
            df_pipeline.drop(columns=['Código de Acesso'], inplace=True)
        colunas_para_converter = ['T01', 'P03', 'T05', 'P12', 'T15']
        for col in colunas_para_converter:
            if col in df_pipeline.columns:
                df_pipeline[col] = pd.to_numeric(df_pipeline[col], errors='coerce')
        print("   ✅ Tratamento inicial concluído.")

        # === Bloco 4: Imputação ===
        print("➡️ Bloco 4: Imputação com Artefatos...")
        colunas_a_remover = ['F0299 - Explicação Tempo', 'T1199Expl', 'T1205Expl'] # Do Bloco 4 notebook
        colunas_removidas = [col for col in colunas_a_remover if col in df_pipeline.columns]
        if colunas_removidas: df_pipeline.drop(columns=colunas_removidas, inplace=True)

        colunas_com_negativos = self.coluns_json.get('colunas_com_negativos', [])
        colunas_nao_respondeu = self.coluns_json.get('colunas_nao_respondeu', [])
        colunas_missing_flags = self.coluns_json.get('colunas_missing', [])

        # Tratamento de negativos
        for col in df_pipeline.select_dtypes(include=np.number).columns:
            if '_nao_respondeu' in col or '_tinha_missing' in col: continue
            mascara_negativos = (df_pipeline[col] < 0).fillna(False)
            if mascara_negativos.sum() > 0:
                df_pipeline.loc[mascara_negativos, col] = self.numeric_medians.get(col, 0)
                if col in colunas_com_negativos:
                    flag_col = f'{col}_nao_respondeu'
                    if flag_col in colunas_nao_respondeu:
                        if flag_col not in df_pipeline: df_pipeline[flag_col] = 0 # Cria se não existe
                        df_pipeline[flag_col] = df_pipeline[flag_col].fillna(0) # Garante que não tenha NaN
                        df_pipeline.loc[mascara_negativos, flag_col] = 1 # Define a flag

        # Tratamento de negativos em strings (raro, mas por segurança)
        for col in df_pipeline.select_dtypes(include='object').columns:
             if col in colunas_com_negativos:
                mascara_negativos_str = df_pipeline[col].astype(str).str.contains(r'^-\\d+$', na=False)
                if mascara_negativos_str.sum() > 0:
                    flag_col = f'{col}_nao_respondeu'
                    if flag_col in colunas_nao_respondeu:
                         if flag_col not in df_pipeline: df_pipeline[flag_col] = 0
                         df_pipeline[flag_col] = df_pipeline[flag_col].fillna(0)
                         df_pipeline.loc[mascara_negativos_str, flag_col] = 1
                    df_pipeline.loc[mascara_negativos_str, col] = self.categorical_modes.get(col, 'Desconhecido')


        # Garante que todas as colunas de flag existem
        for flag_col in colunas_nao_respondeu + colunas_missing_flags:
            if flag_col not in df_pipeline.columns: df_pipeline[flag_col] = 0
            df_pipeline[flag_col] = df_pipeline[flag_col].fillna(0) # Garante que não tenham NaN

        # Preenchimento de NaN
        all_imputable_cols = list(self.numeric_medians.keys()) + list(self.categorical_modes.keys())
        for col in all_imputable_cols:
            if col in df_pipeline.columns and df_pipeline[col].isna().any():
                mascara_nan = df_pipeline[col].isna()
                flag_col = f'{col}_tinha_missing'
                if flag_col in colunas_missing_flags:
                     df_pipeline.loc[mascara_nan, flag_col] = 1
                if col in self.numeric_medians: df_pipeline[col].fillna(self.numeric_medians[col], inplace=True)
                elif col in self.categorical_modes: df_pipeline[col].fillna(self.categorical_modes[col], inplace=True)

        # Fallback para colunas categóricas restantes
        for col in df_pipeline.select_dtypes(include='object').columns:
            if df_pipeline[col].isna().any(): df_pipeline[col].fillna('Desconhecido', inplace=True)
        print("   ✅ Imputação concluída.")

        # === Bloco 5: Cores ===
        print("➡️ Bloco 5: Processamento de Cores...")
        colunas_cor = self.coluns_json.get('colunas_cor', [])
        df_pipeline = preprocessing.engenharia_features_cor(df_pipeline, colunas_cor) # Usa a função do preprocessing.py
        print("   ✅ Cores processadas.")

        # === Bloco 6: Data/Hora ===
        print("➡️ Bloco 6: Processamento Data/Hora...")
        if 'Data/Hora Último' in df_pipeline.columns:
            df_pipeline['Data/Hora Último'] = pd.to_datetime(df_pipeline['Data/Hora Último'], format='%d/%m/%Y %H:%M:%S', errors='coerce')
            if not df_pipeline['Data/Hora Último'].isna().all(): # Só processa se houver datas válidas
                df_pipeline['dia_semana'] = df_pipeline['Data/Hora Último'].dt.dayofweek
                df_pipeline['hora_dia'] = df_pipeline['Data/Hora Último'].dt.hour
                df_pipeline['dia_mes'] = df_pipeline['Data/Hora Último'].dt.day
                df_pipeline['mes'] = df_pipeline['Data/Hora Último'].dt.month
                df_pipeline['periodo_dia'] = pd.cut(df_pipeline['hora_dia'], bins=[-1, 6, 12, 18, 24], labels=[0, 1, 2, 3], right=True).astype(int)
                df_pipeline['eh_fim_semana'] = (df_pipeline['dia_semana'] >= 5).astype(int)
                # Usa date_min do artefato se disponível para consistência, senão usa o min da coluna atual
                date_min_artifact = pd.to_datetime(self.date_min) if self.date_min else df_pipeline['Data/Hora Último'].min() # <-- LINHA NOVA (usa self.date_min)
                df_pipeline['dias_desde_inicio'] = (df_pipeline['Data/Hora Último'] - date_min_artifact).dt.days
                df_pipeline.drop(columns=['Data/Hora Último'], inplace=True)
                print("   ✅ Data/Hora processada.")
            else:
                df_pipeline.drop(columns=['Data/Hora Último'], inplace=True)
                print("   ⚠️ Coluna 'Data/Hora Último' continha apenas valores inválidos. Removida.")
        else:
             print("   ⚠️ Coluna 'Data/Hora Último' não encontrada.")

        # === Bloco 6.1: Remoção Adicional ===
        colunas_a_remover2 = ['Q1202', 'Q1203', 'Q1207', 'Cor0206_eh_preto']
        colunas_removidas2 = [col for col in colunas_a_remover2 if col in df_pipeline.columns]
        if colunas_removidas2: df_pipeline.drop(columns=colunas_removidas2, inplace=True)
        print(f"   🗑️ {len(colunas_removidas2)} colunas (bloco 6.1) removidas.")


        # === Bloco 7, 8, 9: Engenharia de Features I ===
        print("➡️ Bloco 7-9: Engenharia de Features (Parte 1)...")
        df_pipeline = feature_engineering.criar_features_desempenho_jogo1(df_pipeline)
        df_pipeline = feature_engineering.criar_features_tempo_contexto(df_pipeline)
        df_pipeline = feature_engineering.criar_features_interacao(df_pipeline)
        print("   ✅ Engenharia de Features (Parte 1) concluída.")

        # === Bloco 10: Clusterização ===
        print("➡️ Bloco 10: Clusterização...")
        if self.cluster_model and self.cluster_scaler and self.cluster_features:
            missing_cluster_features = [f for f in self.cluster_features if f not in df_pipeline.columns]
            if not missing_cluster_features:
                df_for_clustering = df_pipeline[self.cluster_features].copy()
                 # Tratamento final de NaN/Inf antes de escalar
                for col in df_for_clustering.select_dtypes(include='object').columns:
                    df_for_clustering[col] = pd.Categorical(df_for_clustering[col]).codes
                    df_for_clustering[col] = df_for_clustering[col].replace(-1, np.nan)
                df_for_clustering.fillna(df_for_clustering.median(), inplace=True) # Usa mediana das features selecionadas
                df_for_clustering.replace([np.inf, -np.inf], 0, inplace=True) # Tratamento robusto de infinitos

                X_scaled = self.cluster_scaler.transform(df_for_clustering)
                clusters = self.cluster_model.predict(X_scaled)
                df_pipeline['Cluster'] = clusters
                print("   ✅ Clusterização aplicada.")
            else:
                print(f"   ⚠️ Clusterização não aplicada. Features ausentes: {missing_cluster_features}")
                df_pipeline['Cluster'] = -1 # Valor default indicando que não foi clusterizado
        else:
            print("   ⚠️ Artefatos de clusterização não carregados corretamente. Pulando.")
            df_pipeline['Cluster'] = -1

        # === Bloco 11: Engenharia Final ===
        print("➡️ Bloco 11: Engenharia de Features Final...")
        df_pipeline = feature_engineering.engenharia_final(df_pipeline, self.coluns_json)

        # === Bloco 12: Predição Final ===
        print("➡️ Bloco 12: Predição Final...")
        predictions = {}
        for target in self.targets:
            print(f"   -> Predizendo {target}...")
            features_to_use = self.target_features[target]
            scaler = self.target_scalers[target]
            model = self.target_models[target]

            missing_model_features = [f for f in features_to_use if f not in df_pipeline.columns]
            if missing_model_features:
                 print(f"      ❌ ERRO: Features para {target} não encontradas: {missing_model_features}")
                 predictions[target] = np.full(len(df_pipeline), np.nan) # Predição nula
                 continue

            X_predict = df_pipeline[features_to_use]
            X_predict_scaled = scaler.transform(X_predict)
            prediction = model.predict(X_predict_scaled)
            predictions[target] = prediction
            print(f"      ✅ Predição para {target} concluída.")

        # === Formatação da Saída ===
        print("➡️ Formatando Saída...")

        # Adiciona as colunas de predição ao DataFrame que passou por TODA a pipeline (df_pipeline)
        # df_pipeline contém as colunas Cluster_X criadas no Bloco 11
        df_pipeline['PREDICAO_Target1'] = predictions.get('Target1', np.nan)
        df_pipeline['PREDICAO_Target2'] = predictions.get('Target2', np.nan)
        df_pipeline['PREDICAO_Target3'] = predictions.get('Target3', np.nan)

        # Colunas de predição a serem excluídas do original_data
        pred_cols = ['PREDICAO_Target1', 'PREDICAO_Target2', 'PREDICAO_Target3']

        prediction_rows = []
        # Itera sobre o DataFrame que contém TODAS as features geradas (df_pipeline)
        for index, row in df_pipeline.iterrows():
            # Cria o dicionário original_data a partir da linha atual,
            # excluindo apenas as colunas de predição finais.
            # Isso garante que Cluster_0, Cluster_1, _vs_cluster_mean, etc., sejam incluídos.
            original_dict = row.drop(pred_cols, errors='ignore').to_dict()

            # Trata possíveis NaNs ou Infs remanescentes que não são compatíveis com JSON
            for key, value in original_dict.items():
                if isinstance(value, (int, float)):
                    if pd.isna(value) or np.isinf(value):
                        original_dict[key] = None # Converte NaN/Inf para null (JSON compliant)
                # Opcional: Converter explicitamente numpy types para tipos Python nativos
                if isinstance(value, np.integer):
                    original_dict[key] = int(value)
                elif isinstance(value, np.floating):
                     original_dict[key] = float(value) if not (pd.isna(value) or np.isinf(value)) else None


            prediction_rows.append(
                PredictionRow(
                    PREDICAO_Target1=row['PREDICAO_Target1'] if pd.notna(row['PREDICAO_Target1']) else None, # Envia null se for NaN
                    PREDICAO_Target2=row['PREDICAO_Target2'] if pd.notna(row['PREDICAO_Target2']) else None,
                    PREDICAO_Target3=row['PREDICAO_Target3'] if pd.notna(row['PREDICAO_Target3']) else None,
                    original_data=original_dict
                )
            )

        print("✅ Pipeline concluída com sucesso!")
        return AnalysisResult(
            total_rows=total_rows,
            processed_rows=len(df_pipeline), # Usa o df processado
            predictions=prediction_rows
        )

# Cria a instância única do serviço
prediction_service = PredictionService()