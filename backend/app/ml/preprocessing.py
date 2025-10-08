# backend/app/ml/preprocessing.py

import pandas as pd
import numpy as np

# --- Funções de Transformação e Engenharia ---

def remover_colunas_indesejadas(df: pd.DataFrame, colunas: list) -> pd.DataFrame:
    """Remove uma lista de colunas do DataFrame."""
    df_limpo = df.drop(columns=colunas, errors='ignore')
    print(f"Colunas removidas (se existirem): {colunas}")
    return df_limpo

def hex_para_rgb(hex_code):
    """Converte um código de cor hexadecimal para três valores RGB."""
    hex_code = str(hex_code).lstrip('#').strip()
    if len(hex_code) != 6:
        return np.nan, np.nan, np.nan
    try:
        return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))
    except (ValueError, TypeError):
        return np.nan, np.nan, np.nan

def engenharia_features_cor(df: pd.DataFrame, colunas_hex: list) -> pd.DataFrame:
    """Cria features RGB a partir de colunas de cor hexadecimal."""
    df_eng = df.copy()
    colunas_cor_encontradas = [col for col in df_eng.columns if 'Cor' in col] + colunas_hex
    
    for coluna_hex in set(colunas_cor_encontradas):
        if coluna_hex in df_eng.columns:
            rgb_cols = df_eng[coluna_hex].apply(hex_para_rgb).apply(pd.Series)
            rgb_cols.columns = [f'{coluna_hex}_R', f'{coluna_hex}_G', f'{coluna_hex}_B']
            df_eng = pd.concat([df_eng, rgb_cols], axis=1)
            df_eng.drop(columns=[coluna_hex], inplace=True)
            print(f"Coluna '{coluna_hex}' convertida para RGB.")
            
    return df_eng

def converter_data_para_timestamp(df: pd.DataFrame, coluna_data: str) -> pd.DataFrame:
    """Converte uma coluna de data/hora para timestamp Unix."""
    df_ts = df.copy()
    if coluna_data in df_ts.columns:
        # Tenta converter para datetime, os que falham viram NaT (Not a Time)
        datetimes = pd.to_datetime(df_ts[coluna_data], format='%d/%m/%Y %H:%M:%S', errors='coerce')
        # Converte para timestamp Unix (float), depois para int para remover as casas decimais.
        # NaNs (originados de NaT) são mantidos.
        df_ts[coluna_data] = datetimes.astype('int64') // 10**9
        print(f"Coluna '{coluna_data}' convertida para timestamp.")
    return df_ts

def converter_colunas_numericas_texto(df: pd.DataFrame) -> pd.DataFrame:
    """Converte colunas de texto que contêm apenas números para tipo numérico."""
    df_convertido = df.copy()
    for coluna in df_convertido.select_dtypes(include=['object']).columns:
        # Tenta converter para numérico, o que não for possível vira NaN
        df_convertido[coluna] = pd.to_numeric(df_convertido[coluna], errors='coerce')
    return df_convertido