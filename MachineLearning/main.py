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
import scaling

def main():
    """
    Executa o pipeline completo de processamento de dados, clusterização e treinamento de modelo.
    """
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    print(f"Todos os arquivos de saída serão salvos no diretório: '{config.OUTPUT_DIR}/'")

    # 1. Carregamento e Pré-processamento
    df = data_loader.carregar_dados(config.INPUT_FILE)
    if df is None: return

    df_limpo = data_preprocessor.remover_colunas_indesejadas(df, config.COLUNAS_PARA_REMOVER)
    df_limpo = data_preprocessor.remover_linhas_com_muitos_nulos(df_limpo, 0.10)
    df_limpo = data_preprocessor.remover_linhas_sem_target(df_limpo, config.COLUNAS_OBRIGATORIAS)
    df_limpo = data_preprocessor.engenharia_features_cor(df_limpo, config.COLUNAS_DE_COR_HEX)
    df_limpo = data_preprocessor.converter_data_para_timestamp(df_limpo, 'Data/Hora Último')
    df_limpo = data_preprocessor.converter_colunas_numericas_texto(df_limpo)
    
    df_imputado, info_imputacao = data_preprocessor.imputar_dados_inteligente(
        df_limpo, 
        force_categorical=config.FORCE_CATEGORICAL_COLS,
        target_cols=config.TARGET_COLS
    )
    
    with open(config.IMPUTATION_INFO_JSON, 'w', encoding='utf-8') as f:
        json.dump(info_imputacao, f, indent=4, ensure_ascii=False)
    print(f"Metadados da imputação salvos em '{config.IMPUTATION_INFO_JSON}'")

    # 2. ATUALIZAÇÃO: Etapa de Padronização
    colunas_numericas_para_escala = info_imputacao['colunas_numericas']
    
    # Aplica a padronização (StandardScaler) e usa o DataFrame resultante para o resto do pipeline
    df_padronizado, _ = scaling.padronizar_dados_e_salvar_scaler(
        df_imputado, colunas_numericas_para_escala, config.STANDARD_SCALER_PKL
    )
    # A chamada para a normalização foi removida para simplificar.

    # 3. Etapa de Clusterização
    features_numericas_padronizadas = df_padronizado[colunas_numericas_para_escala]
    
    # Encontra o k ótimo usando os dados já padronizados
    clustering.encontrar_k_otimo(features_numericas_padronizadas, config.RANDOM_STATE)
    
    # Treina o modelo, salva o .pkl, visualiza e retorna os rótulos
    cluster_labels = clustering.treinar_cluster_e_visualizar(
        features_numericas_padronizadas,
        config.K_CLUSTERS,
        config.KMEANS_MODEL_PKL,
        config.RANDOM_STATE
    )

    # Adiciona a nova coluna de cluster ao DataFrame
    df_clusterizado = df_padronizado.copy()
    df_clusterizado['Cluster'] = cluster_labels
    
    df_clusterizado.to_excel(config.PROCESSED_EXCEL_OUTPUT, index=False)
    print(f"\nDataFrame final com clusters salvo em '{config.PROCESSED_EXCEL_OUTPUT}'")

    # 4. Treinamento do Modelo de Regressão
    features_modelo = features_numericas_padronizadas.columns.tolist()
    features_modelo.append('Cluster')

    model_config = {
        'RANDOM_STATE': config.RANDOM_STATE,
        'N_SPLITS_CV': config.N_SPLITS_CV,
        'MODEL_PKL_OUTPUT': config.MODEL_PKL_OUTPUT
    }
    model_trainer.treinar_avaliar_e_salvar_modelos(df_clusterizado, features_modelo, config.TARGET_COLS, model_config)

    # 5. Salvar Artefatos de Imputação
    artefatos_config = {'IMPUTERS_PKL_OUTPUT': config.IMPUTERS_PKL_OUTPUT}
    model_trainer.criar_e_salvar_imputadores(df_imputado, info_imputacao, artefatos_config)

if __name__ == '__main__':
    main()