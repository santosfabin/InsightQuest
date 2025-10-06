# model_trainer.py

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import KFold, cross_val_score
import pickle
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

def treinar_avaliar_e_salvar_modelos(df: pd.DataFrame, features: list, targets: list, config: dict):
    """
    Treina e avalia um modelo LightGBM para cada alvo, e salva os modelos treinados.
    """
    X = df[features]
    y = df[targets]
    
    modelos_finais = {}
    
    print("\n--- INICIANDO TREINAMENTO DOS MODELOS DE PREDIÇÃO ---")
    for target in targets:
        print(f"\n--- Treinando modelo para: {target} ---")
        y_atual = y[target]
        
        model = lgb.LGBMRegressor(random_state=config['RANDOM_STATE'])
        cv = KFold(n_splits=config['N_SPLITS_CV'], shuffle=True, random_state=config['RANDOM_STATE'])
        
        scores = cross_val_score(model, X, y_atual, cv=cv, scoring='neg_mean_squared_error')
        rmse_scores = np.sqrt(-scores)
        
        print(f"Validação Cruzada - RMSE Médio: {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")
        
        # Treinamento final com todos os dados
        model.fit(X, y_atual)
        modelos_finais[target] = model
        print(f"Modelo final para '{target}' treinado.")
        
    # Salvar modelos
    with open(config['MODEL_PKL_OUTPUT'], 'wb') as f:
        pickle.dump(modelos_finais, f)
    print(f"\nModelos salvos com sucesso em '{config['MODEL_PKL_OUTPUT']}'")
    
    return modelos_finais

def criar_e_salvar_imputadores(df: pd.DataFrame, info_colunas: dict, config: dict):
    """
    Cria e salva os objetos SimpleImputer com base nos dados de treino.
    """
    colunas_numericas = [col for col in info_colunas['colunas_numericas'] if col in df.columns]
    colunas_categoricas = [col for col in info_colunas['colunas_categoricas'] if col in df.columns]
    
    print("\n--- Salvando Artefatos de Imputação ---")
    
    # Imputer para dados numéricos, preenchendo com a MEDIANA
    imputer_mediana = SimpleImputer(strategy='median').fit(df[colunas_numericas])

    # Imputer para dados categóricos, preenchendo com a MODA
    imputer_moda = SimpleImputer(strategy='most_frequent').fit(df[colunas_categoricas])

    imputadores = {
        'mediana_num': imputer_mediana,
        'moda_cat': imputer_moda
    }

    # Salvar o dicionário de Imputers
    with open(config['IMPUTERS_PKL_OUTPUT'], 'wb') as file:
        pickle.dump(imputadores, file)
    print(f"Dicionário de SimpleImputers salvo com sucesso em '{config['IMPUTERS_PKL_OUTPUT']}'")