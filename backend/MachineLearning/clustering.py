# clustering.py

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
import pickle

def encontrar_k_otimo(df_numeric_scaled: pd.DataFrame, random_state: int):
    """
    Aplica o método do cotovelo em dados JÁ PADRONIZADOS para sugerir um
    número ótimo de clusters.
    """
    inercia = []
    range_k = range(2, 11)
    
    print("\n--- Análise de Cluster: Método do Cotovelo ---")
    for k in range_k:
        kmeans = KMeans(n_clusters=k, random_state=random_state, n_init=10)
        kmeans.fit(df_numeric_scaled)
        inercia.append(kmeans.inertia_)
        
    plt.figure(figsize=(10, 6))
    plt.plot(range_k, inercia, marker='o', linestyle='--')
    plt.title('Método do Cotovelo (Elbow Method)')
    plt.xlabel('Número de Clusters (k)')
    plt.ylabel('Inércia')
    plt.xticks(range_k)
    plt.grid(True)
    plt.show()

def treinar_cluster_e_visualizar(df_numeric_scaled: pd.DataFrame, k: int, caminho_saida_pkl: str, random_state: int):
    """
    Treina um modelo KMeans, salva o modelo em .pkl, visualiza os clusters
    e retorna os rótulos (labels) de cada ponto de dado.

    Args:
        df_numeric_scaled: DataFrame com as features numéricas já padronizadas.
        k: O número de clusters a ser usado.
        caminho_saida_pkl: O caminho para salvar o modelo .pkl.
        random_state: Seed para reprodutibilidade.

    Returns:
        Um array numpy com o rótulo do cluster para cada linha do DataFrame.
    """
    print(f"\n--- Treinando modelo KMeans com k={k} ---")
    
    # 1. Treinar o modelo
    kmeans_model = KMeans(n_clusters=k, random_state=random_state, n_init=10)
    kmeans_model.fit(df_numeric_scaled)
    
    # 2. Salvar o modelo treinado
    with open(caminho_saida_pkl, 'wb') as file:
        pickle.dump(kmeans_model, file)
    print(f"Modelo KMeans salvo com sucesso em '{caminho_saida_pkl}'")

    # 3. Prever os clusters para os dados de treino (para visualização)
    cluster_labels = kmeans_model.labels_ # .labels_ é mais eficiente que .predict() após o fit

    # 4. Visualização usando PCA
    pca = PCA(n_components=2, random_state=random_state)
    features_2d = pca.fit_transform(df_numeric_scaled)
    
    plt.figure(figsize=(10, 7))
    sns.scatterplot(x=features_2d[:, 0], y=features_2d[:, 1], hue=cluster_labels,
                    palette='viridis', s=100, alpha=0.8)
    plt.title(f'Visualização dos Clusters K-Means (k={k})')
    plt.xlabel('Componente Principal 1')
    plt.ylabel('Componente Principal 2')
    plt.legend(title='Cluster')
    plt.grid(True)
    plt.show()
        
    return cluster_labels