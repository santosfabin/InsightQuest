# clustering.py

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns

def encontrar_k_otimo(df_numeric: pd.DataFrame):
    """
    Aplica o método do cotovelo para sugerir um número ótimo de clusters.
    """
    scaler = StandardScaler()
    features_padronizadas = scaler.fit_transform(df_numeric)
    
    inercia = []
    range_k = range(2, 11)
    
    print("Calculando inércia para diferentes valores de k (Método do Cotovelo)...")
    for k in range_k:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(features_padronizadas)
        inercia.append(kmeans.inertia_)
        
    plt.figure(figsize=(10, 6))
    plt.plot(range_k, inercia, marker='o', linestyle='--')
    plt.title('Método do Cotovelo (Elbow Method)')
    plt.xlabel('Número de Clusters (k)')
    plt.ylabel('Inércia')
    plt.xticks(range_k)
    plt.grid(True)
    plt.show()

def aplicar_kmeans_e_visualizar(df: pd.DataFrame, df_numeric: pd.DataFrame, k: int):
    """
    Aplica KMeans com diferentes pré-processamentos (sem escala, normalizado, padronizado)
    e visualiza os resultados usando PCA.
    """
    cenarios = {
        "SemEscala": df_numeric.copy(),
        "Normalizado": MinMaxScaler().fit_transform(df_numeric),
        "Padronizado": StandardScaler().fit_transform(df_numeric)
    }
    
    df_final = df.copy()
    pca = PCA(n_components=2)

    for nome, data in cenarios.items():
        print(f"\n--- Rodando K-Means para o cenário: {nome} ---")
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(data)
        
        coluna_cluster = f'Cluster_{nome}'
        df_final[coluna_cluster] = clusters
        
        # Visualização
        features_2d = pca.fit_transform(data)
        plt.figure(figsize=(10, 7))
        sns.scatterplot(x=features_2d[:, 0], y=features_2d[:, 1], hue=clusters,
                        palette='viridis', s=100, alpha=0.8)
        plt.title(f'Clusters K-Means (Dados {nome})')
        plt.xlabel('Componente Principal 1')
        plt.ylabel('Componente Principal 2')
        plt.legend(title='Cluster')
        plt.grid(True)
        plt.show()
        
    return df_final