
# Campos de Entrada

[:arrow_backward: Voltar](../)

Os campos de entrada são os blocos de construção de qualquer formulário. Todos são criados com um padrão fluente (method chaining) e compartilham comportamentos comuns como visibilidade condicional, desabilitação e integração com Livewire.

Veja os comportamentos compartilhados em [Visibilidade e desabilitação](./component-behavior) e [Estado e Livewire](./component-state).

---

## Input

O campo de texto de propósito geral. Suporta todos os tipos HTML, máscaras e variações para uso em tabelas inline.

```php
use ErpSaga\Livewire\Resources\Components\Forms\Input;

Input::create('Nome', 'nome')
    ->columns(['md' => 6]);
```

### Tipos HTML

Por padrão o campo é `type="text"`. Para outros tipos:

```php
Input::create('Data de Nascimento', 'nascimento')->type('date');
Input::create('Hora', 'hora')->type('time');
Input::create('Senha', 'senha')->type('password');
Input::create('E-mail', 'email')->type('email');
```

### Campos numéricos

Use `number()` para campos de quantidade ou valor inteiro. Configura automaticamente `type="number"`, `step="any"` e `min=0`.

```php
Input::create('Quantidade', 'quantidade')->number();
```

Para controlar o incremento (ex: valores decimais):

```php
Input::create('Peso (kg)', 'peso')->number()->step('0.001');
Input::create('Porcentagem', 'percentual')->number()->step('0.01');
```

### Máscaras

Aplique máscaras de entrada via Alpine.js `x-mask`:

```php
Input::create('CPF', 'cpf')->mask('999.999.999-99');
Input::create('CNPJ', 'cnpj')->mask('99.999.999/9999-99');
Input::create('Telefone', 'telefone')->mask('(99) 99999-9999');
Input::create('CEP', 'cep')->mask('99999-999');
```

### Transformações

```php
// Converte automaticamente para maiúsculas
Input::create('Código', 'codigo')->uppercase();

// Texto de ajuda abaixo do campo
Input::create('CEP', 'cep')->helperText('Digite apenas números');

// Ícone de informação com tooltip
Input::create('CNPJ', 'cnpj')->info('Informe o CNPJ da empresa matriz');
```

### Alinhamento e aparência

```php
// Centraliza o texto (útil para campos numéricos)
Input::create('Qtd', 'quantidade')->centered();

// Versão compacta (menos padding)
Input::create('Qtd', 'quantidade')->slim();
```

### Input em tabelas inline

Para campos numéricos dentro de tabelas embutidas em formulários, use o atalho `tableNumber()`:

```php
// Equivale a: ->number()->slim()->centered()->setClassCol('min-w-[75px]')
Input::tableNumber('*.quantidade');
```

---

## Select

Select com busca (searchable). Ideal para listas com muitas opções onde o usuário precisa filtrar.

```php
use ErpSaga\Livewire\Resources\Components\Forms\Select;

Select::create('Categoria', 'categoria_id')
    ->options(Categoria::pluck('nome', 'id')->toArray())
    ->columns(['md' => 4]);
```

As options devem ser um array associativo `['valor' => 'Label']`.

### Seleção múltipla

```php
Select::create('Permissões', 'permissoes')
    ->options(Permissao::toOptions())
    ->multiple();
```

Quando `multiple()` é chamado, o valor padrão é automaticamente definido como `[]`.

### Options dinâmicas (via config do Livewire)

Quando as options dependem de outro campo (ex: cidades de um estado), sincronize com a propriedade `$config` da page usando `hasConfigOptions()`:

```php
// No formulário:
Select::create('Cidade', 'cidade_id')
    ->hasConfigOptions()
    ->columns(['md' => 4]);

// Na page Livewire, ao mudar o estado:
public function updatedFormEstadoId($value): void
{
    $this->setConfig('cidade_id', [
        'options' => Cidade::where('estado_id', $value)->pluck('nome', 'id')->toArray(),
    ]);
}
```

---

## SimpleSelect

Select nativo do HTML (sem busca). Mais leve, ideal para listas curtas e estáticas.

```php
use ErpSaga\Livewire\Resources\Components\Forms\SimpleSelect;

SimpleSelect::create('Sexo', 'sexo')
    ->options(['M' => 'Masculino', 'F' => 'Feminino'])
    ->columns(['md' => 3]);
```

Aceita também o formato `[['id' => x, 'label' => y]]`, como o retorno de queries Eloquent:

```php
SimpleSelect::create('UF', 'uf')
    ->options(Estado::all(['sigla as id', 'nome as label'])->toArray());
```

Para remover a opção vazia inicial:

```php
SimpleSelect::create('Tipo', 'tipo')
    ->options(['padrao' => 'Padrão', 'especial' => 'Especial'])
    ->withoutPlaceholder()
    ->default('padrao');
```

---

## Textarea

Campo de texto multilinha. O padrão é 3 linhas.

```php
use ErpSaga\Livewire\Resources\Components\Forms\Textarea;

Textarea::create('Observações', 'observacoes')
    ->columns(['md' => 12]);
```

Para controlar a altura:

```php
Textarea::create('Descrição', 'descricao')->rows(6);
```

Também aceita `helperText()`, `info()` e `uppercase()` via `HasInputBehavior`.

---

## Checkbox

Marcação booleana. Valor padrão: `false`.

```php
use ErpSaga\Livewire\Resources\Components\Forms\Checkbox;

Checkbox::create('Aceito os termos', 'aceite_termos');
Checkbox::create('Enviar notificações', 'notificacoes')->default(true);
```

---

## Toggle

Switch on/off visual. Valor padrão: `false`.

```php
use ErpSaga\Livewire\Resources\Components\Forms\Toggle;

Toggle::create('Ativo', 'ativo')
    ->default(true)
    ->columns(['md' => 3]);
```

Com informação adicional e negrito no label:

```php
Toggle::create('Permite desconto', 'permite_desconto')
    ->info('Habilita o campo de desconto nas vendas')
    ->isBold();
```

---

## Money

Campo monetário formatado em BRL. Exibe separadores de milhar e decimais no padrão brasileiro.

```php
use Modules\Framework\Components\Money;

Money::create('Valor Total', 'valor_total')->columns(['md' => 4]);
Money::create('Desconto', 'desconto')->disabledWhen('tem_desconto', false);
```

---

## DateRange

Campo de intervalo de datas. Pode usar um campo único (string `"YYYY-MM-DD - YYYY-MM-DD"`) ou dois campos separados.

```php
use Modules\Framework\Components\DateRange;

// Dois campos separados
DateRange::create('Período', 'data_inicio', 'data_fim');

// Campo único (string range)
DateRange::create('Competência', 'periodo');
```

Para definir um valor padrão com Carbon:

```php
DateRange::create('Período', 'data_inicio', 'data_fim')
    ->default([now()->startOfMonth(), now()->endOfMonth()]);
```

---

## FileUpload

Upload de arquivos integrado com FilePond. Padrão: aceita qualquer tipo, máximo 20 MB.

```php
use Modules\Framework\Components\FileUpload;

FileUpload::create('Contrato', 'contrato')
    ->accepts(['application/pdf'])
    ->maxSize('10MB');
```

Para múltiplos tipos:

```php
FileUpload::create('Anexos', 'anexos')
    ->accepts(['application/pdf', 'image/jpeg', 'image/png'])
    ->maxSize('5MB');
```

Para salvar os arquivos automaticamente ao submeter o formulário, use o trait `HandlesFileUploadAttachments` na page. Veja [Upload de arquivos](./livewire-uploads).

---

> Veja também: [Visibilidade e desabilitação](./component-behavior) · [Estado e Livewire](./component-state) · [Componentes estruturais](./form-structure)
