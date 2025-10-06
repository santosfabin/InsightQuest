# config.py

import os

# --- Configurações de Diretórios ---
OUTPUT_DIR = 'output'

# --- Configurações de Arquivos ---
INPUT_FILE = 'JogadoresV1.xlsx'

# Caminhos dos artefatos de saída
PROCESSED_EXCEL_OUTPUT = os.path.join(OUTPUT_DIR, 'planilha_processada.xlsx')
MODEL_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'modelo_predicao_regressao.pkl') # Renomeado para clareza
IMPUTATION_INFO_JSON = os.path.join(OUTPUT_DIR, 'colunas_info.json')
IMPUTERS_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'imputadores.pkl')
STANDARD_SCALER_PKL = os.path.join(OUTPUT_DIR, 'standard_scaler.pkl')
MINMAX_SCALER_PKL = os.path.join(OUTPUT_DIR, 'minmax_scaler.pkl')
KMEANS_MODEL_PKL = os.path.join(OUTPUT_DIR, 'kmeans_model.pkl')

# --- Configurações de Colunas ---
COLUNAS_PARA_REMOVER = [
    'F0299 - Explicação Tempo', 'PTempoTotalExpl', 'T1199Expl',
    'T1205Expl', 'T0499 - Explicação Tempo', 'T1210Expl',
    'TempoTotalExpl', 'Q1202', 'Q1203', 'Q1207'
]
COLUNAS_OBRIGATORIAS = ['Target1', 'Target2', 'Target3']
TARGET_COLS = ['Target1', 'Target2', 'Target3']
COLUNAS_DE_COR_HEX = ['F0207']
FORCE_CATEGORICAL_COLS = [
    'Q0401', 'Q0402', 'Q0403', 'Q0405', 'Q0406', 'Q0407', 
    'Q0409', 'Q0410', 'Q0411', 'Q1206', 'Q1208'
]

# --- Configurações de Modelagem ---
RANDOM_STATE = 42
N_SPLITS_CV = 5
K_CLUSTERS = 5