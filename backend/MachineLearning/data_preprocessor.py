# data_preprocessor.py

import pandas as pd
import numpy as np

# --- Funções de Limpeza ---

def remover_colunas_indesejadas(df: pd.DataFrame, colunas: list) -> pd.DataFrame:
    """Remove uma lista de colunas do DataFrame."""
    df_limpo = df.drop(columns=colunas, errors='ignore')
    print(f"Colunas removidas: {len(colunas)}")
    return df_limpo

def remover_linhas_com_muitos_nulos(df: pd.DataFrame, percentual_maximo: float) -> pd.DataFrame:
    """Remove linhas que excedem um percentual máximo de valores ausentes."""
    total_colunas = df.shape[1]
    minimo_preenchidas = int(total_colunas * (1 - percentual_maximo))
    df_limpo = df.dropna(axis=0, thresh=minimo_preenchidas)
    print("Linhas com excesso de valores nulos foram removidas.")
    return df_limpo

def remover_linhas_sem_target(df: pd.DataFrame, colunas_obrigatorias: list) -> pd.DataFrame:
    """Remove linhas onde as colunas alvo são nulas."""
    df_limpo = df.dropna(subset=colunas_obrigatorias)
    print("Linhas com valores nulos nas colunas alvo foram removidas.")
    return df_limpo

# --- Funções de Transformação e Engenharia ---

def converter_colunas_numericas_texto(df: pd.DataFrame) -> pd.DataFrame:
    """Converte colunas de texto que contêm apenas números para tipo numérico."""
    df_convertido = df.copy()
    for coluna in df_convertido.select_dtypes(include=['object']).columns:
        try:
            df_convertido[coluna] = pd.to_numeric(df_convertido[coluna])
            print(f"Coluna '{coluna}' convertida para tipo numérico.")
        except ValueError:
            # A coluna contém valores não numéricos, então a mantemos como texto.
            pass
    return df_convertido



def imputar_dados_inteligente(df: pd.DataFrame, force_categorical: list = None, target_cols: list = None) -> (pd.DataFrame, dict):
    """
    Preenche valores ausentes de forma inteligente, ignorando as colunas alvo,
    e retorna os metadados da imputação.
    - Em colunas CATEGÓRICAS, substitui nulos, decimais e TODOS os números negativos pela moda.
    - Em colunas NUMÉRICAS, cálculos ignoram negativos, e todos os negativos são substituídos.
    """
    df_tratado = df.copy()
    colunas_info = {'colunas_numericas': [], 'colunas_categoricas': [], 'colunas_detalhes': {}}
    
    if force_categorical is None: force_categorical = []
    if target_cols is None: target_cols = []

    for coluna in df_tratado.columns:
        if coluna in target_cols:
            print(f"--- Ignorando a coluna target: '{coluna}' ---")
            continue

        print(f"--- Processando a coluna: '{coluna}' ---")
        df_tratado[coluna].replace(-1, np.nan, inplace=True)
        
        is_numeric = pd.api.types.is_numeric_dtype(df_tratado[coluna])
        num_unicos = df_tratado[coluna].nunique()

        if (not is_numeric or num_unicos < 10) or (coluna in force_categorical):
            # --- ATUALIZAÇÃO: Lógica para colunas CATEGÓRICAS ---
            colunas_info['colunas_categoricas'].append(coluna)

            # 1. CRIAR MÁSCARAS PARA TODOS OS VALORES INVÁLIDOS
            nulos_mask = df_tratado[coluna].isnull()
            decimais_mask = df_tratado[coluna].apply(lambda x: isinstance(x, float) and x % 1 != 0)
            
            # Nova máscara para números negativos.
            # pd.to_numeric com errors='coerce' transforma não-números (ex: texto) em NaN,
            # que não serão < 0, tornando o processo seguro para colunas mistas.
            negativos_mask = pd.to_numeric(df_tratado[coluna], errors='coerce') < 0

            # Combina todas as condições para substituição
            mascara_substituir = nulos_mask | decimais_mask | negativos_mask

            # 2. APLICAR A SUBSTITUIÇÃO PELA MODA
            if mascara_substituir.any():
                # Calcula a moda ignorando os valores que serão substituídos
                moda = df_tratado[coluna][~mascara_substituir].mode()
                if not moda.empty:
                    print(f"Substituindo {mascara_substituir.sum()} valores inválidos (nulos, decimais, negativos) pela moda: '{moda[0]}'")
                    df_tratado.loc[mascara_substituir, coluna] = moda[0]
                    colunas_info['colunas_detalhes'][coluna] = 'moda'
        else:
            # Lógica para colunas NUMÉRICAS (permanece a mesma da sua última versão)
            colunas_info['colunas_numericas'].append(coluna)
            dados_para_calculo = df_tratado[coluna][df_tratado[coluna] > 0]
            if dados_para_calculo.empty:
                print(f"AVISO: Coluna '{coluna}' não possui dados positivos para cálculo. Pulando imputação.")
                continue

            q1, q3 = dados_para_calculo.quantile([0.25, 0.75])
            iqr = q3 - q1
            if iqr > 0:
                lim_inf, lim_sup = q1 - 1.5 * iqr, q3 + 1.5 * iqr
                lim_inf = max(0, lim_inf) 
                outliers_mask = (df_tratado[coluna] < lim_inf) | (df_tratado[coluna] > lim_sup)
            else:
                outliers_mask = pd.Series(False, index=df_tratado.index)

            nulos_mask = df_tratado[coluna].isnull()
            zeros_mask = df_tratado[coluna] == 0
            negativos_mask = df_tratado[coluna] < 0
            mascara_substituir = outliers_mask | nulos_mask | zeros_mask | negativos_mask

            skewness = dados_para_calculo.skew()
            if abs(skewness) < 0.5:
                valor_preenchimento = dados_para_calculo.mean()
                colunas_info['colunas_detalhes'][coluna] = 'média'
            else:
                valor_preenchimento = dados_para_calculo.median()
                colunas_info['colunas_detalhes'][coluna] = 'mediana'
            
            print(f"Substituindo {mascara_substituir.sum()} valores inválidos (nulos, zeros, negativos, outliers) por {valor_preenchimento:.2f}")
            df_tratado.loc[mascara_substituir, coluna] = valor_preenchimento

    print("\nImputação inteligente de dados concluída.")
    return df_tratado, colunas_info



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
    
    for coluna_hex in set(colunas_cor_encontradas): # Usar set para evitar duplicatas
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
        df_ts[coluna_data] = (pd.to_datetime(df_ts[coluna_data], format='%d/%m/%Y %H:%M:%S', errors='coerce')
                              .astype('int64') // 10**9)
        print(f"Coluna '{coluna_data}' convertida para timestamp.")
    return df_ts