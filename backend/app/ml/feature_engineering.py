# backend/app/ml/feature_engineering.py

import pandas as pd
import numpy as np

epsilon = 1e-10

def criar_features_desempenho_jogo1(df: pd.DataFrame) -> pd.DataFrame:
    """Implementa a lógica do Bloco 7 do notebook."""
    print("   -> Criando features de desempenho Jogo 1...")
    df_out = df.copy()
    colunas_jogo1 = ['Q0401', 'Q0402', 'Q0403', 'T0404', 'Q0405', 'Q0406', 'Q0407', 'T0408', 'Q0409', 'Q0410', 'Q0411', 'T0412', 'Q0413', 'Q0414', 'Q0415', 'T0498']
    if not all(col in df_out.columns for col in colunas_jogo1):
        print("      ⚠️ Colunas do Jogo 1 ausentes. Pulando features.")
        return df_out

    total_r1 = df_out['Q0401'] + df_out['Q0402'] + df_out['Q0403'] + epsilon
    df_out['taxa_acerto_r1'] = df_out['Q0401'] / total_r1
    df_out['taxa_erro_r1'] = df_out['Q0402'] / total_r1
    df_out['taxa_omissao_r1'] = df_out['Q0403'] / total_r1
    df_out['tempo_por_questao_r1'] = df_out['T0404'] / total_r1

    total_r2 = df_out['Q0405'] + df_out['Q0406'] + df_out['Q0407'] + epsilon
    df_out['taxa_acerto_r2'] = df_out['Q0405'] / total_r2
    df_out['taxa_erro_r2'] = df_out['Q0406'] / total_r2
    df_out['taxa_omissao_r2'] = df_out['Q0407'] / total_r2
    df_out['tempo_por_questao_r2'] = df_out['T0408'] / total_r2

    total_r3 = df_out['Q0409'] + df_out['Q0410'] + df_out['Q0411'] + epsilon
    df_out['taxa_acerto_r3'] = df_out['Q0409'] / total_r3
    df_out['taxa_erro_r3'] = df_out['Q0410'] / total_r3
    df_out['taxa_omissao_r3'] = df_out['Q0411'] / total_r3
    df_out['tempo_por_questao_r3'] = df_out['T0412'] / total_r3

    total_geral = df_out['Q0413'] + df_out['Q0414'] + df_out['Q0415'] + epsilon
    df_out['taxa_acerto_total'] = df_out['Q0413'] / total_geral
    df_out['taxa_erro_total'] = df_out['Q0414'] / total_geral
    df_out['taxa_omissao_total'] = df_out['Q0415'] / total_geral

    df_out['taxa_acerto_media'] = (df_out['taxa_acerto_r1'] + df_out['taxa_acerto_r2'] + df_out['taxa_acerto_r3']) / 3
    df_out['evolucao_desempenho'] = df_out['taxa_acerto_r3'] - df_out['taxa_acerto_r1']
    df_out['consistencia_acerto'] = df_out[['taxa_acerto_r1', 'taxa_acerto_r2', 'taxa_acerto_r3']].std(axis=1)
    df_out['tempo_medio_questao'] = df_out['T0498'] / total_geral
    df_out['tempo_investido_acertos'] = df_out['T0498'] * df_out['taxa_acerto_total']
    df_out['tempo_desperdicado'] = df_out['T0498'] * df_out['taxa_erro_total']
    df_out['aceleracao'] = df_out['T0412'] / (df_out['T0404'] + epsilon)
    print("      ✅ Features Jogo 1 criadas.")
    return df_out

def criar_features_tempo_contexto(df: pd.DataFrame) -> pd.DataFrame:
    """Implementa a lógica do Bloco 8 do notebook."""
    print("   -> Criando features de Tempo e Contexto...")
    df_out = df.copy()
    colunas_contexto = ['TempoTotalExpl', 'TempoTotal', 'tempo_medio_questao', 'QtdHorasDormi', 'QtdHorasSono', 'Acordar', 'QtdPessoas', 'QtdSom', 'QtdComida', 'F0705', 'F0706', 'F0707', 'F0708', 'F0709', 'F0710', 'F0711', 'F0712', 'F0713', 'F1101', 'F1103', 'F1105', 'F1107', 'F1109', 'F1111', 'TempoTotal11']
    if not all(col in df_out.columns for col in colunas_contexto):
        print("      ⚠️ Colunas de Tempo/Contexto ausentes. Pulando features.")
        return df_out

    df_out['proporcao_tempo_extra'] = df_out['TempoTotalExpl'] / (df_out['TempoTotal'] + epsilon)
    df_out['passou_do_tempo'] = (df_out['TempoTotal'] >= 180).astype(int)
    mediana_tempo = df_out['tempo_medio_questao'].median() # Calcula a mediana nos dados atuais
    df_out['velocidade_relativa'] = df_out['tempo_medio_questao'] / (mediana_tempo + epsilon)
    df_out['qualidade_sono'] = (df_out['QtdHorasDormi'] + df_out['QtdHorasSono']) / 2
    df_out['sono_adequado'] = (df_out['QtdHorasSono'] >= 2).astype(int)
    df_out['acordou_cedo'] = (df_out['Acordar'] <= 2).astype(int)
    df_out['indice_descanso'] = df_out['qualidade_sono'] * (5 - df_out['Acordar']) # Assumindo Acordar como escala 1-5
    df_out['nivel_social'] = df_out['QtdPessoas'] + df_out['QtdSom']
    df_out['ambiente_estimulante'] = (df_out['nivel_social'] >= 3).astype(int)
    df_out['comeu_adequadamente'] = (df_out['QtdComida'] >= 2).astype(int)
    colunas_emocional = ['F0705', 'F0706', 'F0707', 'F0708', 'F0709', 'F0710', 'F0711', 'F0712', 'F0713']
    df_out['media_emocional'] = df_out[colunas_emocional].mean(axis=1)
    df_out['estabilidade_emocional'] = df_out[colunas_emocional].std(axis=1)
    df_out['respostas_positivas_questionario'] = (df_out[colunas_emocional] >= 4).sum(axis=1)
    df_out['respostas_negativas_questionario'] = (df_out[colunas_emocional] <= 2).sum(axis=1)
    colunas_satisfacao = ['F1101', 'F1103', 'F1105', 'F1107', 'F1109', 'F1111']
    df_out['satisfacao_jogo'] = df_out[colunas_satisfacao].mean(axis=1)
    df_out['engajamento'] = df_out['satisfacao_jogo'] * df_out['TempoTotal11']
    print("      ✅ Features Tempo/Contexto criadas.")
    return df_out

def criar_features_interacao(df: pd.DataFrame) -> pd.DataFrame:
    """Implementa a lógica do Bloco 9 do notebook."""
    print("   -> Criando features de Interação...")
    df_out = df.copy()
    features_criadas = 0

    required_cols_1 = ['taxa_acerto_total', 'qualidade_sono', 'nivel_social', 'tempo_medio_questao', 'media_emocional', 'taxa_erro_total']
    if all(c in df_out.columns for c in required_cols_1):
        df_out['desempenho_sono'] = df_out['taxa_acerto_total'] * df_out['qualidade_sono']
        df_out['desempenho_social'] = df_out['taxa_acerto_total'] * df_out['nivel_social']
        df_out['velocidade_energia'] = df_out['tempo_medio_questao'] / (df_out['qualidade_sono'] + epsilon)
        df_out['acertos_quando_positivo'] = df_out['taxa_acerto_total'] * (df_out['media_emocional'] / 5)
        df_out['erros_quando_negativo'] = df_out['taxa_erro_total'] * (1 - df_out['media_emocional'] / 5)
        features_criadas += 5

    required_cols_2 = ['Q1201', 'Q1203', 'T1204', 'Q1206', 'Q1208', 'Q1209']
    if all(c in df_out.columns for c in required_cols_2):
        total_parte_a = df_out['Q1201'] + df_out['Q1203'] + epsilon
        df_out['taxa_acerto_parte_a'] = df_out['Q1201'] / total_parte_a
        df_out['eficiencia_parte_a'] = df_out['taxa_acerto_parte_a'] / (df_out['T1204'] + epsilon)
        total_parte_b = df_out['Q1206'] + df_out['Q1208'] + epsilon
        df_out['taxa_acerto_parte_b'] = df_out['Q1206'] / total_parte_b
        df_out['passou_limite_b'] = (df_out['Q1209'] >= 300).astype(int)
        df_out['melhoria_jogo3'] = df_out['taxa_acerto_parte_b'] - df_out['taxa_acerto_parte_a']
        df_out['consistencia_jogo3'] = (df_out['taxa_acerto_parte_a'] - df_out['taxa_acerto_parte_b']).abs()
        features_criadas += 6

    colunas_p = [col for col in df_out.columns if col.startswith('P') and col[1:].isdigit() and len(col) <= 5] # Heurística para pegar P01, P02...
    if len(colunas_p) > 0:
        df_out['soma_respostas_positivas'] = (df_out[colunas_p] >= 4).sum(axis=1)
        df_out['soma_respostas_negativas'] = (df_out[colunas_p] <= 2).sum(axis=1)
        df_out['tendencia_positiva'] = df_out['soma_respostas_positivas'] / (len(colunas_p) + epsilon)
        df_out['polarizacao'] = (df_out['soma_respostas_positivas'] - df_out['soma_respostas_negativas']).abs()
        features_criadas += 4

    required_cols_3 = ['taxa_acerto_r1', 'taxa_acerto_r2', 'taxa_acerto_r3']
    if all(c in df_out.columns for c in required_cols_3):
        cols_variabilidade = ['taxa_acerto_r1', 'taxa_acerto_r2', 'taxa_acerto_r3']
        if 'taxa_acerto_parte_a' in df_out.columns: cols_variabilidade.extend(['taxa_acerto_parte_a', 'taxa_acerto_parte_b'])
        df_out['variabilidade_total'] = df_out[cols_variabilidade].std(axis=1)
        df_out['jogador_estavel'] = (df_out['variabilidade_total'] < 0.1).astype(int)
        features_criadas += 2

    if features_criadas > 0:
      print(f"      ✅ {features_criadas} Features de Interação criadas.")
    else:
      print("      ⚠️ Nenhuma Feature de Interação criada (colunas ausentes).")
    return df_out

def engenharia_final(df: pd.DataFrame, coluns_json: dict) -> pd.DataFrame:
    """Implementa a lógica do Bloco 11 do notebook."""
    print("   -> Iniciando Engenharia Final...")
    df_out = df.copy()

    # --- 1. LIMPEZA CONTROLADA PELO JSON ---
    colunas_deletar = coluns_json.get('colunas_deletar', [])
    colunas_removidas = [col for col in colunas_deletar if col in df_out.columns]
    if colunas_removidas:
        df_out.drop(columns=colunas_removidas, inplace=True)
        print(f"      🗑️ {len(colunas_removidas)} colunas removidas via 'colunas_deletar'.")

    # --- 2. PRÉ-PROCESSAMENTO FINAL DE ROBUSTEZ ---
    for col in df_out.select_dtypes(include='object').columns:
        df_out[col] = pd.Categorical(df_out[col]).codes
        df_out[col] = df_out[col].replace(-1, np.nan) # -1 de 'não visto' vira NaN

    for col in df_out.columns:
        if df_out[col].isna().sum() > 0:
            df_out[col].fillna(df_out[col].median(), inplace=True) # Fallback com mediana

    df_out.fillna(0, inplace=True) # Fallback final com 0
    df_out.replace([np.inf, -np.inf], 0, inplace=True)
    print("      ✅ Codificação 'object', tratamento NaN/Inf finalizados.")

    # --- 3. CRIAÇÃO DE FEATURES AVANÇADAS (BASEADO EM CLUSTER) ---
    if 'Cluster' in df_out.columns:
        print("      -> Criando features baseadas em Cluster...")
        CLUSTER_COL = 'Cluster'
        # One-Hot Encoding
        cluster_dummies = pd.get_dummies(df_out[CLUSTER_COL], prefix=CLUSTER_COL, dtype=int)
        df_out = pd.concat([df_out, cluster_dummies], axis=1)

        # Features de Interação (valor - média do cluster)
        numeric_cols_for_interaction = df_out.select_dtypes(include=np.number).columns.tolist()
        if CLUSTER_COL in numeric_cols_for_interaction: numeric_cols_for_interaction.remove(CLUSTER_COL)
        # Remove as dummies recém-criadas para não calcular interação delas com elas mesmas
        numeric_cols_for_interaction = [c for c in numeric_cols_for_interaction if not c.startswith(f"{CLUSTER_COL}_")]

        cluster_means = df_out.groupby(CLUSTER_COL)[numeric_cols_for_interaction].transform('mean')
        interaction_features = df_out[numeric_cols_for_interaction].subtract(cluster_means)
        interaction_features.columns = [f'{col}_vs_cluster_mean' for col in interaction_features.columns]
        df_out = pd.concat([df_out, interaction_features], axis=1)
        df_out.drop(columns=[CLUSTER_COL], inplace=True) # Remove a original

        # Features de Agregação por Prefixo
        prefixes = {p: [col for col in df_out.columns if col.startswith(p) and not col.endswith(('_mean', '_std', '_range'))] for p in ['Q0', 'P', 'T', 'F']}
        for prefix, cols in prefixes.items():
            valid_cols = [c for c in cols if c in df_out.columns] # Garante que as colunas existem
            if len(valid_cols) >= 3:
                df_out[f'{prefix}_mean'] = df_out[valid_cols].mean(axis=1)
                df_out[f'{prefix}_std'] = df_out[valid_cols].std(axis=1)
                df_out[f'{prefix}_range'] = df_out[valid_cols].max(axis=1) - df_out[valid_cols].min(axis=1)

        # Features Polinomiais (baseadas nas top10 de cada target)
        for target, top_cols in [('Target1', coluns_json.get('target1_top10', [])),
                                ('Target2', coluns_json.get('target2_top10', [])),
                                ('Target3', coluns_json.get('target3_top10', []))]:
            for col in top_cols:
                if col in df_out.columns:
                    df_out[f'{target}_{col}_sq'] = df_out[col]**2
                    # Adiciona pequeno valor para evitar sqrt(0) ou log(0) se necessário no futuro
                    df_out[f'{target}_{col}_sqrt'] = np.sqrt(np.abs(df_out[col]) + epsilon)

        # Limpeza final pós-engenharia
        df_out.replace([np.inf, -np.inf], 0, inplace=True)
        df_out.fillna(0, inplace=True)
        print("      ✅ Features baseadas em Cluster criadas.")
    else:
        print("      ⚠️ Coluna 'Cluster' não encontrada, engenharia avançada ignorada.")

    print("   ✅ Engenharia Final concluída.")
    return df_out