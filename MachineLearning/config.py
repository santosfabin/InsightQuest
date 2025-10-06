import os

OUTPUT_DIR = 'output'

INPUT_FILE = 'JogadoresV1.xlsx'

PROCESSED_EXCEL_OUTPUT = os.path.join(OUTPUT_DIR, 'planilha_processada.xlsx')
MODEL_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'modelo_predicao.pkl')
IMPUTATION_INFO_JSON = os.path.join(OUTPUT_DIR, 'colunas_info.json')
SCALER_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'scaler.pkl')
IMPUTERS_PKL_OUTPUT = os.path.join(OUTPUT_DIR, 'imputadores.pkl')

COLUNAS_PARA_REMOVER = [
    'F0299 - Explicação Tempo', 'PTempoTotalExpl', 'T1199Expl',
    'T1205Expl', 'T0499 - Explicação Tempo', 'T1210Expl',
    'TempoTotalExpl', 'Q1202', 'Q1203', 'Q1207'
]
COLUNAS_OBRIGATORIAS = ['Target1', 'Target2', 'Target3']
TARGET_COLS = ['Target1', 'Target2', 'Target3']
COLUNAS_DE_COR_HEX = ['F0207']

RANDOM_STATE = 42
N_SPLITS_CV = 5
K_CLUSTERS = 5