from pathlib import Path

# O Ponto de partida é o diretório 'app'
# Path(__file__) -> Obtém o caminho do arquivo atual (config.py)
# .parent -> Sobe um nível para o diretório 'core'
# .parent -> Sobe mais um nível para o diretório 'app'
APP_DIR = Path(__file__).parent.parent

class Settings:
    """
    Configurações centrais da aplicação.
    """
    # Caminho para a pasta que conterá os artefatos de Machine Learning.
    # Ex: backend/app/ml/
    ML_ARTIFACTS_PATH: Path = APP_DIR / "ml"

# Cria uma instância única das configurações para ser usada em toda a aplicação
settings = Settings()