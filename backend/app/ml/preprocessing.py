# backend/app/ml/preprocessing.py

import pandas as pd
import numpy as np

# --- Funções de Limpeza e Transformação ---

def remover_colunas_indesejadas(df: pd.DataFrame, colunas: list) -> pd.DataFrame:
    """Remove uma lista de colunas do DataFrame."""
    colunas_existentes = [col for col in colunas if col in df.columns]
    df_limpo = df.drop(columns=colunas_existentes, errors='ignore')
    if colunas_existentes:
        print(f"   🗑️ Colunas removidas (se existiam): {colunas_existentes}")
    return df_limpo

def hex_para_rgb(hex_color):
    """
    Converte um código de cor hexadecimal para três valores RGB.
    Retorna (255, 255, 255) - branco - em caso de erro ou valor inválido/ausente.
    """
    # Trata NaN, None ou 'Desconhecido' explicitamente
    if pd.isna(hex_color) or str(hex_color).strip().upper() in ['DESCONHECIDO', 'NAN', 'NONE', '']:
        return 255, 255, 255 # Retorna branco como padrão para inválidos/ausentes

    hex_color_str = str(hex_color).strip().upper()
    if hex_color_str.startswith('#'):
        hex_color_str = hex_color_str[1:]

    if len(hex_color_str) != 6:
        return 255, 255, 255 # Branco se o formato estiver incorreto

    try:
        r = int(hex_color_str[0:2], 16)
        g = int(hex_color_str[2:4], 16)
        b = int(hex_color_str[4:6], 16)
        return r, g, b
    except (ValueError, TypeError):
        return 255, 255, 255 # Branco em caso de erro na conversão

# --- FUNÇÃO CORRIGIDA ---
def engenharia_features_cor(df: pd.DataFrame, colunas_hex_config: list) -> pd.DataFrame:
    """
    Cria features RGB e derivadas (brilho, saturação, etc.) a partir de colunas HEX,
    replicando a lógica do Bloco 5 do notebook NewPipelineV2.
    Remove a coluna HEX original após o processamento.
    """
    df_eng = df.copy()
    # Identifica colunas de cor no DataFrame que estão na lista de configuração
    colunas_para_processar = [col for col in colunas_hex_config if col in df_eng.columns]

    if not colunas_para_processar:
        print("   ⚠️ Nenhuma coluna de cor configurada ('colunas_cor' no JSON) encontrada no DataFrame. Pulando Bloco 5.")
        return df_eng

    print(f"   -> Processando {len(colunas_para_processar)} colunas de cor: {colunas_para_processar}")
    for coluna_hex in colunas_para_processar:
        # Aplica a conversão HEX -> RGB (com tratamento de erro robusto)
        rgb_tuples = df_eng[coluna_hex].apply(hex_para_rgb)

        # Cria as colunas R, G, B
        r_col, g_col, b_col = f'{coluna_hex}_R', f'{coluna_hex}_G', f'{coluna_hex}_B'
        df_eng[r_col] = rgb_tuples.apply(lambda x: x[0])
        df_eng[g_col] = rgb_tuples.apply(lambda x: x[1])
        df_eng[b_col] = rgb_tuples.apply(lambda x: x[2])

        # Cria features derivadas (Bloco 5 do Notebook)
        # Brilho
        df_eng[f'{coluna_hex}_brilho'] = (df_eng[r_col] + df_eng[g_col] + df_eng[b_col]) / 3
        # Saturação (simplificada como range)
        rgb_df = df_eng[[r_col, g_col, b_col]]
        df_eng[f'{coluna_hex}_saturacao'] = rgb_df.max(axis=1) - rgb_df.min(axis=1)
        # Flags (eh_branco, eh_preto) - Comparando com o HEX original antes de dropar
        # Convertendo para string e maiúsculas para comparação segura
        hex_original_upper = df_eng[coluna_hex].astype(str).str.strip().str.upper().str.replace('#', '', regex=False)
        df_eng[f'{coluna_hex}_eh_branco'] = (hex_original_upper == 'FFFFFF').astype(int)
        df_eng[f'{coluna_hex}_eh_preto'] = (hex_original_upper == '000000').astype(int)
        # Flag eh_cinza (diferença pequena entre R, G, B)
        df_eng[f'{coluna_hex}_eh_cinza'] = (df_eng[f'{coluna_hex}_saturacao'] < 20).astype(int) # Limiar de 20 como no notebook
        # Flags de Cor Dominante
        r_max = (df_eng[r_col] >= df_eng[g_col]) & (df_eng[r_col] >= df_eng[b_col])
        g_max = (df_eng[g_col] > df_eng[r_col]) & (df_eng[g_col] >= df_eng[b_col]) # > R para desempate
        df_eng[f'{coluna_hex}_dominio_R'] = r_max.astype(int)
        df_eng[f'{coluna_hex}_dominio_G'] = g_max.astype(int)
        df_eng[f'{coluna_hex}_dominio_B'] = (~r_max & ~g_max).astype(int) # B domina se R e G não dominam

        # Remove a coluna HEX original
        df_eng.drop(columns=[coluna_hex], inplace=True)
        print(f"      ✅ Coluna '{coluna_hex}' processada (RGB + Derivadas).")

    return df_eng

# --- Outras Funções (Mantidas como estavam) ---

def converter_data_para_timestamp(df: pd.DataFrame, coluna_data: str) -> pd.DataFrame:
    """Converte uma coluna de data/hora para timestamp Unix."""
    # ESTA FUNÇÃO NÃO É MAIS USADA NA PIPELINE V2, que cria features como dia_semana, hora_dia, etc.
    # Mas podemos mantê-la aqui caso seja útil em outro contexto.
    df_ts = df.copy()
    if coluna_data in df_ts.columns:
        datetimes = pd.to_datetime(df_ts[coluna_data], format='%d/%m/%Y %H:%M:%S', errors='coerce')
        df_ts[coluna_data] = datetimes.astype('int64') // 10**9
        print(f"      (Info: Coluna '{coluna_data}' convertida para timestamp, mas V2 usa features derivadas)")
    return df_ts

def converter_colunas_numericas_texto(df: pd.DataFrame) -> pd.DataFrame:
    """Converte colunas object que contêm apenas números para tipo numérico."""
    # ESTA FUNÇÃO NÃO É MAIS USADA NA PIPELINE V2, que trata tipos de forma mais robusta
    # no Bloco 11. Mas mantemos por segurança.
    df_convertido = df.copy()
    print("   -> Tentando converter colunas 'object' para numérico (se aplicável)...")
    converted_cols = []
    for coluna in df_convertido.select_dtypes(include=['object']).columns:
        # Tenta a conversão, mas só aplica se for bem-sucedida para a maioria não-nula
        converted_series = pd.to_numeric(df_convertido[coluna], errors='coerce')
        if converted_series.notna().sum() > df_convertido[coluna].notna().sum() * 0.9: # Ex: >90% convertível
             df_convertido[coluna] = converted_series
             converted_cols.append(coluna)
    if converted_cols:
        print(f"      ✅ Colunas 'object' convertidas para numérico: {converted_cols}")
    return df_convertido