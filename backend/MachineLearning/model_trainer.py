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
    Função auxiliar genérica para treinar e avaliar qualquer modelo de regressão com múltiplas métricas.
    Retorna os modelos treinados e um dicionário contendo os resultados de todas as métricas.
    """
    modelos_finais = {}
    
    metrics_results = {
        'RMSE': {}, 'MAE': {}, 'MSE': {}, 'MAPE': {}, 'R2': {}
    }

    for target_name in targets:
        print(f"--- Treinando para o alvo: {target_name} ---")
        y_target_atual = y[target_name]

        # 1. Avaliação com Validação Cruzada para TODAS as métricas
        mse_cv_scores = cross_val_score(model, X, y_target_atual, cv=cv_config, scoring='neg_mean_squared_error')
        mse_scores = -mse_cv_scores
        rmse_scores = np.sqrt(mse_scores)
        
        mae_cv_scores = cross_val_score(model, X, y_target_atual, cv=cv_config, scoring='neg_mean_absolute_error')
        mae_scores = -mae_cv_scores
        
        mape_cv_scores = cross_val_score(model, X, y_target_atual, cv=cv_config, scoring='neg_mean_absolute_percentage_error')
        mape_scores = -mape_cv_scores
        
        r2_cv_scores = cross_val_score(model, X, y_target_atual, cv=cv_config, scoring='r2')

        print(f"  -> RMSE Médio (CV): {rmse_scores.mean():.4f} (+/- {rmse_scores.std():.4f})")
        print(f"  -> MAE Médio (CV):  {mae_scores.mean():.4f} (+/- {mae_scores.std():.4f})")
        print(f"  -> MSE Médio (CV):  {mse_scores.mean():.4f} (+/- {mse_scores.std():.4f})")
        print(f"  -> MAPE Médio (CV): {mape_scores.mean():.4f} (+/- {mape_scores.std():.4f})")
        print(f"  -> R² Médio (CV):   {r2_cv_scores.mean():.4f} (+/- {r2_cv_scores.std():.4f})")

        metrics_results['RMSE'][target_name] = rmse_scores.mean()
        metrics_results['MAE'][target_name] = mae_scores.mean()
        metrics_results['MSE'][target_name] = mse_scores.mean()
        metrics_results['MAPE'][target_name] = mape_scores.mean()
        metrics_results['R2'][target_name] = r2_cv_scores.mean()

        # 2. Treinamento do Modelo Final com todos os dados
        final_model_instance = model.__class__(**model.get_params())
        final_model_instance.fit(X, y_target_atual)
        modelos_finais[target_name] = final_model_instance
    
    return modelos_finais, metrics_results

def executar_todos_os_treinamentos(df_scaled, df_unscaled, features, targets, config):
    """
    Orquestra o treinamento de todos os modelos de regressão.
    """
    X_scaled = df_scaled[features]
    X_unscaled = df_unscaled[features]
    y = df_scaled[targets] 

    cv_strategy = KFold(n_splits=config['N_SPLITS_CV'], shuffle=True, random_state=config['RANDOM_STATE'])
    
    all_model_metrics = {}

    # --- 1. LightGBM ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: LightGBM\n" + "="*50)
    model_lgbm = lgb.LGBMRegressor(random_state=config['RANDOM_STATE'])
    modelos_lgbm, metrics_lgbm = _treinar_e_avaliar_regressor(model_lgbm, X_unscaled, y, targets, cv_strategy)
    all_model_metrics['LightGBM'] = metrics_lgbm
    with open(config['LIGHTGBM_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_lgbm, f)
    print(f"-> Modelos LightGBM salvos em '{config['LIGHTGBM_MODEL_PKL']}'")

    # --- 2. Random Forest ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: Random Forest\n" + "="*50)
    model_rf = RandomForestRegressor(n_estimators=100, random_state=config['RANDOM_STATE'], n_jobs=-1)
    modelos_rf, metrics_rf = _treinar_e_avaliar_regressor(model_rf, X_unscaled, y, targets, cv_strategy)
    all_model_metrics['RandomForest'] = metrics_rf
    with open(config['RANDOMFOREST_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_rf, f)
    print(f"-> Modelos Random Forest salvos em '{config['RANDOMFOREST_MODEL_PKL']}'")

    # --- 3. SVR ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: SVR\n" + "="*50)
    model_svr = SVR(kernel='rbf')
    modelos_svr, metrics_svr = _treinar_e_avaliar_regressor(model_svr, X_scaled, y, targets, cv_strategy)
    all_model_metrics['SVR'] = metrics_svr
    with open(config['SVR_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_svr, f)
    print(f"-> Modelos SVR salvos em '{config['SVR_MODEL_PKL']}'")

    # --- 4. Ridge ---
    print("\n" + "="*50 + "\n🚀 INICIANDO TREINAMENTO: Ridge Regression\n" + "="*50)
    model_ridge = Ridge(alpha=1.0, random_state=config['RANDOM_STATE'])
    modelos_ridge, metrics_ridge = _treinar_e_avaliar_regressor(model_ridge, X_scaled, y, targets, cv_strategy)
    all_model_metrics['Ridge'] = metrics_ridge
    with open(config['RIDGE_MODEL_PKL'], 'wb') as f:
        pickle.dump(modelos_ridge, f)
    print(f"-> Modelos Ridge salvos em '{config['RIDGE_MODEL_PKL']}'")

    # --- Salvando o relatório completo de performance ---
    print("\n" + "="*50 + "\n📊 SALVANDO RELATÓRIO DE PERFORMANCE COMPLETO\n" + "="*50)
    # ### ALTERAÇÃO CHAVE: Busca o caminho do arquivo diretamente do config ###
    results_filename = config['METRICS_RESULTS_JSON']
    with open(results_filename, 'w', encoding='utf-8') as f:
        json.dump(all_model_metrics, f, indent=4)
    print(f"Resultados de todas as métricas salvos em '{results_filename}'")
    
    # --- Exibir resultados finais no console ---
    metric_names = ['RMSE', 'MAE', 'MSE', 'MAPE', 'R2']
    for metric in metric_names:
        print(f"\n--- RESUMO DOS RESULTADOS ({metric} Médio) ---")
        summary_data = {model_name: metrics[metric] for model_name, metrics in all_model_metrics.items()}
        df_summary = pd.DataFrame(summary_data).round(4)
        print(df_summary)
    
    print("\n" + "="*50)


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