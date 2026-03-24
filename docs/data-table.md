# DataTable e Filtros

O ecossistema interno conta com uma arquitetura fluida para listagens em tabelas, incluindo gerenciamento robusto de consultas avançadas de forma intuitiva.

## A Entidade `Filter`

O `Filter` (`Modules\Framework\DataTable\Filter`) encapsula uma instrução atrelada a uma coluna (ou várias) e converte-a automaticamente em uma cláusula SQL via Query Builder conectando de forma inteligente colunas, valores buscados e relações no Entity Framework (Eloquent).

### Como um Filtro Base Funciona

Para criar condições na busca, você herda `Filter` e implementa o método requerido `createWhere(string $column)`.
O Filter base por padrão irá:
1. Validar se deve ser adicionado via `isValid()`.
2. Adicionar o operador `or` dentro dos agrupamentos se múltiplas colunas forem solicitadas.
3. Procurar em tabela relacional (`whereHas`) se uma string de relação for provida.
