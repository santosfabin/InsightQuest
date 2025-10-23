# backend/app/services/prediction_service.py

import pandas as pd
import joblib
import pickle
import json
import numpy as np
from pydantic import BaseModel
from typing import Dict, Optional, List
from sklearn.metrics import r2_score

from app.core.config import settings
from app.models.prediction_schema import AnalysisResult, PredictionRow, HeatmapDataRow, HeatmapDataItem
from app.ml import preprocessing, feature_engineering

class HeatmapDataItem(BaseModel):
    x: str
    y: float

class HeatmapDataRow(BaseModel):
    id: str
    data: List[HeatmapDataItem]

class PredictionService:
    def __init__(self):
        """ Carrega todos os novos artefatos de ML (V2) """
        try:
            print("Carregando artefatos de Machine Learning (V2) para o serviço...")
            artifacts_path = settings.ML_ARTIFACTS_PATH
            prediction_artifacts_path = artifacts_path / "artefazos_predicao"

            with open(artifacts_path / "generic_preprocessing_artifacts.pkl", "rb") as f:
                generic_artifacts = pickle.load(f)
            self.numeric_medians = generic_artifacts.get('numeric_medians', {})
            self.categorical_modes = generic_artifacts.get('categorical_modes', {})
            self.date_min = generic_artifacts.get('date_min')
            print("✅ 'generic_preprocessing_artifacts.pkl' carregado.")

            with open(artifacts_path / "coluns.json", "r", encoding='utf-8') as f:
                self.coluns_json = json.load(f)
            print("✅ 'coluns.json' carregado.")

            with open(artifacts_path / "clustering_artifacts_v2.pkl", "rb") as f:
                cluster_artifacts = pickle.load(f)
            self.cluster_scaler = cluster_artifacts.get('scaler')
            self.cluster_model = cluster_artifacts.get('model')
            self.cluster_features = cluster_artifacts.get('features', [])
            print("✅ 'clustering_artifacts_v2.pkl' carregado.")

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
        print("\n🚀 Iniciando Pipeline de Predição V2...")
        df_pipeline = df.copy()
        total_rows = len(df_pipeline)

        # CORREÇÃO 1: Preserva o 'Código de Acesso'
        codigos_de_acesso = df_pipeline['Código de Acesso'].copy() if 'Código de Acesso' in df_pipeline.columns else None
        if 'Código de Acesso' in df_pipeline.columns:
            df_pipeline.drop(columns=['Código de Acesso'], inplace=True)
        
        colunas_para_converter = ['T01', 'P03', 'T05', 'P12', 'T15']
        for col in colunas_para_converter:
            if col in df_pipeline.columns:
                df_pipeline[col] = pd.to_numeric(df_pipeline[col], errors='coerce')

        colunas_a_remover = ['F0299 - Explicação Tempo', 'T1199Expl', 'T1205Expl']
        df_pipeline.drop(columns=[col for col in colunas_a_remover if col in df_pipeline.columns], inplace=True)

        colunas_com_negativos = self.coluns_json.get('colunas_com_negativos', [])
        colunas_nao_respondeu = self.coluns_json.get('colunas_nao_respondeu', [])
        colunas_missing_flags = self.coluns_json.get('colunas_missing', [])

        for col in df_pipeline.select_dtypes(include=np.number).columns:
            if '_nao_respondeu' in col or '_tinha_missing' in col: continue
            mascara_negativos = (df_pipeline[col] < 0).fillna(False)
            if mascara_negativos.sum() > 0:
                df_pipeline.loc[mascara_negativos, col] = self.numeric_medians.get(col, 0)
                if col in colunas_com_negativos:
                    flag_col = f'{col}_nao_respondeu'
                    if flag_col in colunas_nao_respondeu:
                        if flag_col not in df_pipeline: df_pipeline[flag_col] = 0
                        df_pipeline[flag_col] = df_pipeline[flag_col].fillna(0)
                        df_pipeline.loc[mascara_negativos, flag_col] = 1

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

        for flag_col in colunas_nao_respondeu + colunas_missing_flags:
            if flag_col not in df_pipeline.columns: df_pipeline[flag_col] = 0
            df_pipeline[flag_col] = df_pipeline[flag_col].fillna(0)

        all_imputable_cols = list(self.numeric_medians.keys()) + list(self.categorical_modes.keys())
        for col in all_imputable_cols:
            if col in df_pipeline.columns and df_pipeline[col].isna().any():
                mascara_nan = df_pipeline[col].isna()
                flag_col = f'{col}_tinha_missing'
                if flag_col in colunas_missing_flags:
                     df_pipeline.loc[mascara_nan, flag_col] = 1
                if col in self.numeric_medians: df_pipeline[col].fillna(self.numeric_medians[col], inplace=True)
                elif col in self.categorical_modes: df_pipeline[col].fillna(self.categorical_modes[col], inplace=True)

        for col in df_pipeline.select_dtypes(include='object').columns:
            if df_pipeline[col].isna().any(): df_pipeline[col].fillna('Desconhecido', inplace=True)
        
        colunas_cor = self.coluns_json.get('colunas_cor', [])
        df_pipeline = preprocessing.engenharia_features_cor(df_pipeline, colunas_cor)

        if 'Data/Hora Último' in df_pipeline.columns:
            df_pipeline['Data/Hora Último'] = pd.to_datetime(df_pipeline['Data/Hora Último'], format='%d/%m/%Y %H:%M:%S', errors='coerce')
            if not df_pipeline['Data/Hora Último'].isna().all():
                df_pipeline['dia_semana'] = df_pipeline['Data/Hora Último'].dt.dayofweek
                df_pipeline['hora_dia'] = df_pipeline['Data/Hora Último'].dt.hour
                df_pipeline['mes'] = df_pipeline['Data/Hora Último'].dt.month
                # --- INÍCIO DA CORREÇÃO 2 ---
                # Adiciona a criação da feature 'dia_mes' que estava faltando
                df_pipeline['dia_mes'] = df_pipeline['Data/Hora Último'].dt.day
                # --- FIM DA CORREÇÃO 2 ---
                df_pipeline['eh_fim_semana'] = (df_pipeline['dia_semana'] >= 5).astype(int)
                date_min_artifact = pd.to_datetime(self.date_min) if self.date_min else df_pipeline['Data/Hora Último'].min()
                df_pipeline['dias_desde_inicio'] = (df_pipeline['Data/Hora Último'] - date_min_artifact).dt.days
                df_pipeline.drop(columns=['Data/Hora Último'], inplace=True)

        colunas_a_remover2 = ['Q1202', 'Q1203', 'Q1207', 'Cor0206_eh_preto']
        df_pipeline.drop(columns=[col for col in colunas_a_remover2 if col in df_pipeline.columns], inplace=True)

        df_pipeline = feature_engineering.criar_features_desempenho_jogo1(df_pipeline)
        df_pipeline = feature_engineering.criar_features_tempo_contexto(df_pipeline)
        df_pipeline = feature_engineering.criar_features_interacao(df_pipeline)

        if self.cluster_model and self.cluster_scaler and self.cluster_features:
            missing_cluster_features = [f for f in self.cluster_features if f not in df_pipeline.columns]
            if not missing_cluster_features:
                df_for_clustering = df_pipeline[self.cluster_features].copy()
                df_for_clustering.fillna(df_for_clustering.median(), inplace=True)
                X_scaled = self.cluster_scaler.transform(df_for_clustering)
                df_pipeline['Cluster'] = self.cluster_model.predict(X_scaled)
            else:
                df_pipeline['Cluster'] = -1
        else:
            df_pipeline['Cluster'] = -1

        df_pipeline = feature_engineering.engenharia_final(df_pipeline, self.coluns_json)

        predictions = {}
        for target in self.targets:
            print(f"   -> Predizendo {target}...")
            features_to_use = self.target_features[target]
            scaler = self.target_scalers[target]
            model = self.target_models[target]

            missing_model_features = [f for f in features_to_use if f not in df_pipeline.columns]
            if missing_model_features:
                 print(f"      ❌ ERRO: Features para {target} não encontradas: {missing_model_features}")
                 predictions[target] = np.full(len(df_pipeline), np.nan)
                 continue

            X_predict = df_pipeline[features_to_use].copy()
            
            invalid_cols = X_predict.columns[X_predict.isna().any() | np.isinf(X_predict).any()].tolist()
            if invalid_cols:
                print(f"      ⚠️ AVISO: Encontrados valores NaN/Inf nas colunas para {target}: {invalid_cols}")
                for col in invalid_cols:
                    median_val = X_predict[col].median()
                    X_predict[col].fillna(median_val, inplace=True)
                X_predict.replace([np.inf, -np.inf], 0, inplace=True)
                print("         -> Valores inválidos corrigidos.")

            try:
                X_predict_scaled = scaler.transform(X_predict)
                prediction = model.predict(X_predict_scaled)
                predictions[target] = prediction
                print(f"      ✅ Predição para {target} concluída.")
            except Exception as e:
                print(f"      ❌ ERRO ao prever {target}: {e}")
                predictions[target] = np.full(len(df_pipeline), np.nan)

        # --- SEÇÃO ADICIONAL: CÁLCULO DO R² ---
        print("    -> Calculando R² (se houver dados reais)...")
        r2_scores: Dict[str, Optional[float]] = {
            'Target1': None,
            'Target2': None,
            'Target3': None
        }
        
        for target in self.targets:
            if target in df.columns:
                y_true_series = pd.to_numeric(df[target], errors='coerce')
                y_pred_series = pd.Series(predictions.get(target))
                
                valid_mask = y_true_series.notna() & y_pred_series.notna()
                
                if valid_mask.sum() > 1: # Precisa de pelo menos 2 pontos
                    y_true_valid = y_true_series[valid_mask]
                    y_pred_valid = y_pred_series[valid_mask]
                    try:
                        score = r2_score(y_true_valid, y_pred_valid)
                        r2_scores[target] = float(score)
                        print(f"         ✅ R² para {target}: {score:.4f}")
                    except Exception as r2_e:
                        print(f"         ⚠️ Não foi possível calcular R² para {target}: {r2_e}")
                else:
                    print(f"         ℹ️ Coluna {target} real encontrada, mas sem dados válidos suficientes para R².")
            else:
                print(f"         ℹ️ Coluna {target} real não encontrada no CSV. Pulando R².")
        # --- FIM DA SEÇÃO R² ---

        df_pipeline['PREDICAO_Target1'] = predictions.get('Target1', np.nan)
        df_pipeline['PREDICAO_Target2'] = predictions.get('Target2', np.nan)
        df_pipeline['PREDICAO_Target3'] = predictions.get('Target3', np.nan)

        heatmap_data: Optional[List[HeatmapDataRow]] = None
        try:
            print("    -> Calculando Heatmap de Correlação...")
            pred_cols = ['PREDICAO_Target1', 'PREDICAO_Target2', 'PREDICAO_Target3']
            
            # Pega as features mais importantes do seu coluns.json
            top_features = list(set(
                self.coluns_json.get('target1_top10', []) +
                self.coluns_json.get('target2_top10', []) +
                self.coluns_json.get('target3_top10', [])
            ))
            # Adiciona outras features-chave que criamos
            key_features = [
                'taxa_acerto_total', 'tempo_medio_questao', 'media_emocional', 
                'qualidade_sono', 'satisfacao_jogo', 'Cluster_0', 'Cluster_1'
            ]
            features_to_corr = sorted(list(set(top_features + key_features)))
            # Garante que as colunas realmente existem no DF processado
            features_to_corr = [f for f in features_to_corr if f in df_pipeline.columns]

            if features_to_corr:
                # Calcula a matriz de correlação completa
                corr_matrix = df_pipeline[features_to_corr + pred_cols].corr()
                
                # Filtra apenas a correlação das features contra as predições
                corr_data = corr_matrix[pred_cols].loc[features_to_corr]
                
                # Formata para o Nivo
                heatmap_dict_list = [] # <-- MUDANÇA: Agora é _dict_list
                for feature, row in corr_data.iterrows():
                    # Cria um dicionário para a linha
                    nivo_row_dict = {"id": feature, "data": []} # <-- MUDANÇA: É um dict
                    for target_name, value in row.items():
                        if pd.notna(value):
                            clean_target_name = target_name.replace('PREDICAO_', '')
                            # Cria um dicionário para o ponto de dado
                            data_item_dict = {"x": clean_target_name, "y": round(value, 3)} # <-- MUDANÇA: É um dict
                            nivo_row_dict["data"].append(data_item_dict) # <-- Adiciona o dict
                    heatmap_dict_list.append(nivo_row_dict) # <-- Adiciona o dict da linha
                
                heatmap_data = heatmap_dict_list
                print(f"         ✅ Heatmap de correlação calculado para {len(heatmap_data)} features.")
            else:
                print("         ℹ️ Nenhuma feature de correlação encontrada para o heatmap.")
        except Exception as e:
            print(f"         ⚠️ Erro ao calcular heatmap de correlação: {e}")

        # CORREÇÃO 1: Adiciona o 'Código de Acesso' de volta
        if codigos_de_acesso is not None:
            codigos_de_acesso.index = df_pipeline.index
            df_pipeline['Código de Acesso (Original)'] = codigos_de_acesso
            
        prediction_rows = []
        for index, row in df_pipeline.iterrows():
            original_dict = row.drop(['PREDICAO_Target1', 'PREDICAO_Target2', 'PREDICAO_Target3'], errors='ignore').to_dict()
            for key, value in original_dict.items():
                if isinstance(value, (np.integer, np.floating)) and (pd.isna(value) or np.isinf(value)):
                    original_dict[key] = None
                elif isinstance(value, np.integer):
                    original_dict[key] = int(value)
                elif isinstance(value, np.floating):
                    original_dict[key] = float(value)

            prediction_rows.append(
                PredictionRow(
                    PREDICAO_Target1=row['PREDICAO_Target1'] if pd.notna(row['PREDICAO_Target1']) else None,
                    PREDICAO_Target2=row['PREDICAO_Target2'] if pd.notna(row['PREDICAO_Target2']) else None,
                    PREDICAO_Target3=row['PREDICAO_Target3'] if pd.notna(row['PREDICAO_Target3']) else None,
                    original_data=original_dict
                )
            )

        print("✅ Pipeline concluída com sucesso!")
        return AnalysisResult(
            total_rows=total_rows,
            processed_rows=len(df_pipeline),
            predictions=prediction_rows,
            r2_score_target1=r2_scores['Target1'],
            r2_score_target2=r2_scores['Target2'],
            r2_score_target3=r2_scores['Target3'],
            correlation_heatmap_data=heatmap_data
        )
        

prediction_service = PredictionService()