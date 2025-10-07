# data_loader.py

import pandas as pd

def carregar_dados(caminho_arquivo: str) -> pd.DataFrame:
    """
    Carrega os dados de um arquivo Excel (.xlsx).

    Args:
        caminho_arquivo: O caminho para o arquivo Excel.

    Returns:
        Um DataFrame do pandas com os dados carregados.
    """
    try:
        df = pd.read_excel(caminho_arquivo)
        print(f"Arquivo '{caminho_arquivo}' carregado com sucesso.")
        return df
    except FileNotFoundError:
        print(f"Erro: O arquivo '{caminho_arquivo}' não foi encontrado.")
        return None
    except Exception as e:
        print(f"Ocorreu um erro inesperado ao carregar o arquivo: {e}")
        return None