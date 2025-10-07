# scaling.py

import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import pickle

def padronizar_dados_e_salvar_scaler(df: pd.DataFrame, colunas_numericas: list, caminho_saida: str) -> (pd.DataFrame, StandardScaler):
    """
    Aplica a padronização (StandardScaler) às colunas numéricas de um DataFrame,
    salva o objeto scaler treinado em um arquivo .pkl e retorna o DataFrame modificado.

    Args:
        df: O DataFrame a ser processado.
        colunas_numericas: Lista de nomes das colunas para padronizar.
        caminho_saida: O caminho do arquivo .pkl onde o scaler será salvo.

    Returns:
        Uma tupla contendo:
        - O DataFrame com as colunas numéricas padronizadas.
        - O objeto StandardScaler treinado.
    """
    df_padronizado = df.copy()
    scaler = StandardScaler()

    # Treina o scaler e transforma os dados
    dados_padronizados = scaler.fit_transform(df_padronizado[colunas_numericas])

    # Cria um novo DataFrame com os dados padronizados e as colunas originais
    df_temp = pd.DataFrame(dados_padronizados, index=df_padronizado.index, columns=colunas_numericas)

    # Atualiza as colunas no DataFrame original
    df_padronizado.update(df_temp)
    
    # Salva o objeto scaler treinado
    with open(caminho_saida, 'wb') as file:
        pickle.dump(scaler, file)
    
    print(f"Dados padronizados. Objeto StandardScaler salvo em '{caminho_saida}'")
    
    return df_padronizado, scaler

def normalizar_dados_e_salvar_scaler(df: pd.DataFrame, colunas_numericas: list, caminho_saida: str) -> (pd.DataFrame, MinMaxScaler):
    """
    Aplica a normalização (MinMaxScaler) às colunas numéricas de um DataFrame,
    salva o objeto scaler treinado em um arquivo .pkl e retorna o DataFrame modificado.

    Args:
        df: O DataFrame a ser processado.
        colunas_numericas: Lista de nomes das colunas para normalizar.
        caminho_saida: O caminho do arquivo .pkl onde o scaler será salvo.

    Returns:
        Uma tupla contendo:
        - O DataFrame com as colunas numéricas normalizadas.
        - O objeto MinMaxScaler treinado.
    """
    df_normalizado = df.copy()
    scaler = MinMaxScaler()

    # Treina o scaler e transforma os dados
    dados_normalizados = scaler.fit_transform(df_normalizado[colunas_numericas])

    # Cria um novo DataFrame com os dados normalizados
    df_temp = pd.DataFrame(dados_normalizados, index=df_normalizado.index, columns=colunas_numericas)

    # Atualiza as colunas no DataFrame original
    df_normalizado.update(df_temp)

    # Salva o objeto scaler treinado
    with open(caminho_saida, 'wb') as file:
        pickle.dump(scaler, file)

    print(f"Dados normalizados. Objeto MinMaxScaler salvo em '{caminho_saida}'")

    return df_normalizado, scaler