# model_trainer.py

import pandas as pd
import numpy as np
import pickle
import json

# Importar todos os modelos necessários
import lightgbm as lgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.linear_model import Ridge

# Importar ferramentas de avaliação
from sklearn.model_selection import KFold, cross_val_score
from sklearn.impute import SimpleImputer

def _treinar_e_avaliar_regressor(model, X, y, targets, cv_config):
    """
    Função auxiliar genérica para treinar e avaliar qualquer modelo de regressão.
    """
    modelos_finais = {}
    rmse_scores_dict = {}

    for target_name in targets:
        print(f"--- Treinando para o alvo: {target_name} ---")
        y_target_atual = y[target_name]

        # 1. Avaliação com Validação Cruzada
        scores = cross_val_score(model, X, y_target_atual, cv=cv_config, scoring='neg_mean_squared_error')
        rmse_scores = np.sqrt(-scores)
        
        print(f"RMSE Médio (CV): {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")
        rmse_scores_dict[target_name] = rmse_scores.mean()

        # 2. Treinamento do Modelo Final com todos os dados
        model.fit(X, y_target_atual)
        modelos_finais[target_name] = model
    
    return modelos_finais, rmse_scores_dict

def executar_todos_os_treinamentos(df_scaled, df_unscaled, features, targets, config):
    """
    Orquestra o treinamento de todos os modelos de regressão.
    """
    X_scaled = df_scaled[features]
    X_unscaled = df_unscaled[features]
    y = df_scaled[targets] # y é o mesmo para ambos

    cv_strategy = KFold(n_splits=config['N_SPLITS_CV'], shuffle=True, random_state=config['RANDOM_STATE'])
    
    resultados_rmse_gerais = {}

    # --- 1. LightGBM (Usa dados não padronizados) ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: LightGBM\n" + "="*50)
    model_lgbm = lgb.LGBMRegressor(random_state=config['RANDOM_STATE'])
    modelos_lgbm, rmse_lgbm = _treinar_e_avaliar_regressor(model_lgbm, X_unscaled, y, targets, cv_strategy)
    resultados_rmse_gerais['LightGBM'] = rmse_lgbm
    with open(config['LIGHTGBM_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_lgbm, f)
    print(f"-> Modelos LightGBM salvos em '{config['LIGHTGBM_MODEL_PKL']}'")

    # --- 2. Random Forest (Usa dados não padronizados) ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: Random Forest\n" + "="*50)
    model_rf = RandomForestRegressor(n_estimators=100, random_state=config['RANDOM_STATE'], n_jobs=-1)
    modelos_rf, rmse_rf = _treinar_e_avaliar_regressor(model_rf, X_unscaled, y, targets, cv_strategy)
    resultados_rmse_gerais['RandomForest'] = rmse_rf
    with open(config['RANDOMFOREST_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_rf, f)
    print(f"-> Modelos Random Forest salvos em '{config['RANDOMFOREST_MODEL_PKL']}'")

    # --- 3. SVR (Usa dados PADRONIZADOS) ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: SVR (Support Vector Regressor)\n" + "="*50)
    model_svr = SVR(kernel='rbf')
    modelos_svr, rmse_svr = _treinar_e_avaliar_regressor(model_svr, X_scaled, y, targets, cv_strategy)
    resultados_rmse_gerais['SVR'] = rmse_svr
    with open(config['SVR_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_svr, f)
    print(f"-> Modelos SVR salvos em '{config['SVR_MODEL_PKL']}'")

    # --- 4. Ridge (Usa dados PADRONIZADOS) ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: Ridge Regression\n" + "="*50)
    model_ridge = Ridge(alpha=1.0, random_state=config['RANDOM_STATE'])
    modelos_ridge, rmse_ridge = _treinar_e_avaliar_regressor(model_ridge, X_scaled, y, targets, cv_strategy)
    resultados_rmse_gerais['Ridge'] = rmse_ridge
    with open(config['RIDGE_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_ridge, f)
    print(f"-> Modelos Ridge salvos em '{config['RIDGE_MODEL_PKL']}'")

    # --- Salvando o relatório de RMSE ---
    print("\n" + "="*50 + "\n📊 SALVANDO RELATÓRIO DE PERFORMANCE (RMSE)\n" + "="*50)
    with open(config['RMSE_RESULTS_JSON'], 'w', encoding='utf-8') as f:
        json.dump(resultados_rmse_gerais, f, indent=4)
    print(f"Resultados de RMSE salvos em '{config['RMSE_RESULTS_JSON']}'")
    
    # Exibir resultados finais no console
    print("\n--- RESUMO DOS RESULTADOS (RMSE Médio) ---")
    print(pd.DataFrame(resultados_rmse_gerais).round(4))
    print("="*50)


def criar_e_salvar_imputadores(df: pd.DataFrame, info_colunas: dict, config: dict):
    """
    Cria e salva os objetos SimpleImputer com base nos dados de treino.
    """
    colunas_numericas = [col for col in info_colunas['colunas_numericas'] if col in df.columns]
    colunas_categoricas = [col for col in info_colunas['colunas_categoricas'] if col in df.columns]
    
    print("\n--- Salvando Artefatos de Imputação ---")
    imputer_mediana = SimpleImputer(strategy='median').fit(df[colunas_numericas])
    imputer_moda = SimpleImputer(strategy='most_frequent').fit(df[colunas_categoricas])
    imputadores = {'mediana_num': imputer_mediana, 'moda_cat': imputer_moda}

    with open(config['IMPUTERS_PKL_OUTPUT'], 'wb') as file:
        pickle.dump(imputadores, file)
    print(f"Dicionário de SimpleImputers salvo com sucesso em '{config['IMPUTERS_PKL_OUTPUT']}'")