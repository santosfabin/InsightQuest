# config.py

# --- Configurações de Arquivos ---
INPUT_FILE = 'JogadoresV1.xlsx'
PROCESSED_EXCEL_OUTPUT = 'planilha_processada.xlsx'
MODEL_PKL_OUTPUT = 'modelo_predicao.pkl'
IMPUTATION_INFO_JSON = 'colunas_info.json'
SCALER_PKL_OUTPUT = 'scaler.pkl'
IMPUTERS_PKL_OUTPUT = 'imputadores.pkl'

# --- Configurações de Colunas ---
COLUNAS_PARA_REMOVER = [
    'F0299 - Explicação Tempo', 'PTempoTotalExpl', 'T1199Expl',
    'T1205Expl', 'T0499 - Explicação Tempo', 'T1210Expl',
    'TempoTotalExpl', 'Q1202', 'Q1203', 'Q1207'
]

# Colunas que não podem ter valores nulos
COLUNAS_OBRIGATORIAS = ['Target1', 'Target2', 'Target3']

# Colunas alvo para os modelos de regressão
TARGET_COLS = ['Target1', 'Target2', 'Target3']

# Colunas de cor para engenharia de features
# Adicionamos 'F0207' que estava separado no script original
COLUNAS_DE_COR_HEX = ['F0207']

# --- Configurações de Modelagem ---
RANDOM_STATE = 42
N_SPLITS_CV = 5
K_CLUSTERS = 5 # Definido com base na análise do método do cotovelo