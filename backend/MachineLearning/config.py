# config.py

import os

# --- Configurações de Diretórios ---
OUTPUT_DIR = 'output'

# --- Configurações de Arquivos ---
INPUT_FILE = 'JogadoresV1.xlsx'

# ATUALIZAÇÃO: Caminhos mais descritivos para os arquivos de dados
PRE_SCALING_EXCEL_OUTPUT = os.path.join(OUTPUT_DIR, 'planilha_pre_padronizacao.xlsx') # NOVO ARQUIVO
POST_SCALING_EXCEL_OUTPUT = os.path.join(OUTPUT_DIR, 'planilha_pos_padronizacao_com_cluster.xlsx') # Renomeado para clareza

# Caminhos dos artefatos
IMPUTATION_INFO_JSON = os.path.join(OUTPUT_DIR, 'colunas_info.json')
IMPUTERS_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'imputadores.pkl')
STANDARD_SCALER_PKL = os.path.join(OUTPUT_DIR, 'standard_scaler.pkl')
KMEANS_MODEL_PKL = os.path.join(OUTPUT_DIR, 'kmeans_model.pkl')

# Caminhos dos modelos de regressão
LIGHTGBM_MODEL_PKL = os.path.join(OUTPUT_DIR, 'model_lightgbm.pkl')
RANDOMFOREST_MODEL_PKL = os.path.join(OUTPUT_DIR, 'model_randomforest.pkl')
SVR_MODEL_PKL = os.path.join(OUTPUT_DIR, 'model_svr.pkl')
RIDGE_MODEL_PKL = os.path.join(OUTPUT_DIR, 'model_ridge.pkl')

# Arquivo de resultados
RMSE_RESULTS_JSON = os.path.join(OUTPUT_DIR, 'rmse_results.json')

# --- Configurações de Colunas ---
# ... (o resto do arquivo permanece o mesmo) ...
COLUNAS_PARA_REMOVER = [
    'F0299 - Explicação Tempo', 'PTempoTotalExpl', 'T1199Expl',
    'T1205Expl', 'T0499 - Explicação Tempo', 'T1210Expl',
    'TempoTotalExpl', 'Q1202', 'Q1203', 'Q1207'
]
COLUNAS_OBRIGATORIAS = ['Target1', 'Target2', 'Target3']
TARGET_COLS = ['Target1', 'Target2', 'Target3']

# >>> NOVO: Define as colunas a serem explicitamente ignoradas na padronização e clusterização <<<
COLUNAS_PARA_IGNORAR_NA_CLUSTERIZACAO = [
    'Target1', 'Target2', 'Target3', 'Código de Acesso'
]

COLUNAS_DE_COR_HEX = ['F0207']
FORCE_CATEGORICAL_COLS = [
    'Q0401', 'Q0402', 'Q0403', 'Q0405', 'Q0406', 'Q0407', 
    'Q0409', 'Q0410', 'Q0411', 'Q1206', 'Q1208'
]

# --- Configurações de Modelagem ---
RANDOM_STATE = 42
N_SPLITS_CV = 5
K_CLUSTERS = 3