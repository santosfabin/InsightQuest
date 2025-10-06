# main.py

import json
import pandas as pd
import numpy as np
import os

# Importar módulos e configurações
import config
import data_loader
import data_preprocessor
import clustering
import model_trainer

def main():
    """
    Executa o pipeline completo de processamento de dados, clusterização e treinamento de modelo.
    """
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    print(f"Todos os arquivos de saída serão salvos no diretório: '{config.OUTPUT_DIR}/'")

    # 1. Carregamento dos Dados
    df = data_loader.carregar_dados(config.INPUT_FILE)
    if df is None:
        return

    # 2. Pré-processamento e Engenharia de Features
    df_limpo = data_preprocessor.remover_colunas_indesejadas(df, config.COLUNAS_PARA_REMOVER)
    df_limpo = data_preprocessor.remover_linhas_com_muitos_nulos(df_limpo, 0.10)
    df_limpo = data_preprocessor.remover_linhas_sem_target(df_limpo, config.COLUNAS_OBRIGATORIAS)
    df_limpo = data_preprocessor.engenharia_features_cor(df_limpo, config.COLUNAS_DE_COR_HEX)
    df_limpo = data_preprocessor.converter_data_para_timestamp(df_limpo, 'Data/Hora Último')
    df_limpo = data_preprocessor.converter_colunas_numericas_texto(df_limpo)
    
    # ATUALIZAÇÃO: Passamos também a lista de colunas target para serem ignoradas na imputação.
    df_final, info_imputacao = data_preprocessor.imputar_dados_inteligente(
        df_limpo, 
        force_categorical=config.FORCE_CATEGORICAL_COLS,
        target_cols=config.TARGET_COLS
    )
    
    # Salvar informações de imputação
    with open(config.IMPUTATION_INFO_JSON, 'w', encoding='utf-8') as f:
        json.dump(info_imputacao, f, indent=4, ensure_ascii=False)
    print(f"Metadados da imputação salvos em '{config.IMPUTATION_INFO_JSON}'")

    # 3. Clusterização
    features_numericas = df_final.select_dtypes(include=np.number).drop(columns=config.TARGET_COLS, errors='ignore')
    clustering.encontrar_k_otimo(features_numericas)
    
    print(f"\nAplicando KMeans com k={config.K_CLUSTERS} clusters...")
    df_clusterizado = clustering.aplicar_kmeans_e_visualizar(df_final, features_numericas, config.K_CLUSTERS)
    
    df_clusterizado.to_excel(config.PROCESSED_EXCEL_OUTPUT, index=False)
    print(f"\nDataFrame final com clusters salvo em '{config.PROCESSED_EXCEL_OUTPUT}'")

    # 4. Treinamento do Modelo
    features_modelo = features_numericas.columns.tolist()
    
    cluster_cols = [col for col in df_clusterizado.columns if 'Cluster_' in col]
    features_modelo.extend(cluster_cols)
    features_modelo = list(dict.fromkeys(features_modelo))

    model_config = {
        'RANDOM_STATE': config.RANDOM_STATE,
        'N_SPLITS_CV': config.N_SPLITS_CV,
        'MODEL_PKL_OUTPUT': config.MODEL_PKL_OUTPUT
    }
    model_trainer.treinar_avaliar_e_salvar_modelos(df_clusterizado, features_modelo, config.TARGET_COLS, model_config)

    # 5. Salvar Artefatos de Pré-processamento para Produção
    artefatos_config = {
        'SCALER_PKL_OUTPUT': config.SCALER_PKL_OUTPUT,
        'IMPUTERS_PKL_OUTPUT': config.IMPUTERS_PKL_OUTPUT
    }
    model_trainer.criar_e_salvar_artefatos_preprocessamento(df_final, info_imputacao, artefatos_config)

if __name__ == '__main__':
    main()