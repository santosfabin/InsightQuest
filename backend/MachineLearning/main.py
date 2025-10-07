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

    # ... (etapas de limpeza e engenharia de features) ...
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

    df_imputado.to_excel(config.PRE_SCALING_EXCEL_OUTPUT, index=False)
    print(f"\nDataFrame pré-padronização salvo em '{config.PRE_SCALING_EXCEL_OUTPUT}'")

    # 2. Padronização
    # --- LÓGICA ATUALIZADA PARA SELECIONAR COLUNAS ---
    print("\nIdentificando colunas para padronização e clusterização...")
    # Pega todas as colunas disponíveis no dataframe após a limpeza e imputação
    colunas_disponiveis = df_imputado.columns.tolist()
    
    # Cria a lista de colunas a serem usadas, removendo aquelas que devem ser ignoradas
    colunas_para_padronizar = [
        col for col in colunas_disponiveis 
        if col not in config.COLUNAS_PARA_IGNORAR_NA_CLUSTERIZACAO
    ]
    
    # Garante que apenas colunas numéricas sejam usadas, pois o scaler só funciona com números
    # Isso evita erros caso alguma coluna de texto (ex: ID) não tenha sido explicitamente ignorada
    colunas_finais_para_padronizar = df_imputado[colunas_para_padronizar].select_dtypes(include=np.number).columns.tolist()
    
    print(f"Total de {len(colunas_finais_para_padronizar)} colunas selecionadas para o processo.")
    
    # Alerta o usuário se alguma coluna foi deixada de fora por não ser numérica
    colunas_descartadas = set(colunas_para_padronizar) - set(colunas_finais_para_padronizar)
    if colunas_descartadas:
        print(f"Atenção: As seguintes colunas foram descartadas por não serem numéricas: {list(colunas_descartadas)}")

    df_padronizado, _ = scaling.padronizar_dados_e_salvar_scaler(
        df_imputado, colunas_finais_para_padronizar, config.STANDARD_SCALER_PKL
    )

    # 3. Clusterização
    features_para_cluster = df_padronizado[colunas_finais_para_padronizar]
    clustering.encontrar_k_otimo(features_para_cluster, config.RANDOM_STATE)
    cluster_labels = clustering.treinar_cluster_e_visualizar(
        features_para_cluster, config.K_CLUSTERS, config.KMEANS_MODEL_PKL, config.RANDOM_STATE
    )

    # 4. Preparar DataFrames para Treinamento
    df_scaled_final = df_padronizado.copy()
    df_scaled_final['Cluster'] = cluster_labels
    
    df_unscaled_final = df_imputado.copy()
    df_unscaled_final['Cluster'] = cluster_labels
    
    df_scaled_final.to_excel(config.POST_SCALING_EXCEL_OUTPUT, index=False)
    print(f"DataFrame pós-padronização com clusters salvo em '{config.POST_SCALING_EXCEL_OUTPUT}'")

    # 5. Treinamento de Todos os Modelos
    features_para_modelo = colunas_finais_para_padronizar + ['Cluster']
    
    trainer_config = {
        'RANDOM_STATE': config.RANDOM_STATE,
        'N_SPLITS_CV': config.N_SPLITS_CV,
        'LIGHTGBM_MODEL_PKL': config.LIGHTGBM_MODEL_PKL,
        'RANDOMFOREST_MODEL_PKL': config.RANDOMFOREST_MODEL_PKL,
        'SVR_MODEL_PKL': config.SVR_MODEL_PKL,
        'RIDGE_MODEL_PKL': config.RIDGE_MODEL_PKL,
        'RMSE_RESULTS_JSON': config.RMSE_RESULTS_JSON
    }

    model_trainer.executar_todos_os_treinamentos(
        df_scaled=df_scaled_final,
        df_unscaled=df_unscaled_final,
        features=features_para_modelo,
        targets=config.TARGET_COLS,
        config=trainer_config
    )

    # 6. Salvar Artefatos de Imputação
    artefatos_config = {'IMPUTERS_PKL_OUTPUT': config.IMPUTERS_PKL_OUTPUT}
    model_trainer.criar_e_salvar_imputadores(df_imputado, info_imputacao, artefatos_config)

if __name__ == '__main__':
    main()