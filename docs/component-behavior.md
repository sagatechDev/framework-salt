
# Visibilidade e desabilitação

[:arrow_backward: Voltar](../)

Todos os campos de formulário suportam controle de visibilidade e desabilitação via método encadeado. As condições podem ser estáticas (`true`/`false`), closures, ou baseadas no valor de outros campos.

---

## Visibilidade

### Ocultando um campo

```php
// Sempre oculto
Input::create('Campo Interno', 'campo_interno')->hidden();

// Oculto por condição
Input::create('Token', 'token')->hidden(fn() => !app()->isLocal());
```

### Visível apenas em certas operações

```php
// Visível apenas ao criar
Input::create('Senha', 'senha')->visibleOn('create');

// Visível apenas ao editar
Input::create('Criado em', 'created_at')->visibleOn('update');

// Oculto ao criar e ao editar
Input::create('ID', 'id')->hiddenOn(['create', 'update']);
```

As operações disponíveis são: `'create'`, `'update'`, `'view'`, `'filter'`.

### Visível ou oculto baseado em outro campo

```php
// Visível quando tipo_pessoa é 'J'
Input::create('CNPJ', 'cnpj')
    ->visibleWhen('form.tipo_pessoa', 'J');

// Oculto quando status é 'inativo'
Input::create('Motivo', 'motivo_inativacao')
    ->hiddenWhen('form.status', 'inativo');
```

O primeiro argumento é o path do campo no componente Livewire. Por padrão o operador é `EQUAL`. Para outros operadores:

```php
use ErpSaga\Enums\Operator;

Input::create('Desconto Extra', 'desconto_extra')
    ->visibleWhen('form.total', 1000, Operator::GREATER_THAN);
```

### Visível ou oculto quando campo está vazio

```php
// Oculto quando logradouro está vazio (null, '', '0')
Input::create('Complemento', 'complemento')
    ->hiddenWhenEmpty('form.logradouro');

// Visível apenas quando o campo está vazio
Input::create('Placeholder', 'placeholder')
    ->visibleWhenEmpty('form.valor');
```

---

## Desabilitação

Campos desabilitados ficam visíveis mas não podem ser editados.

> Um campo oculto (`hidden`) também é automaticamente considerado desabilitado.

### Desabilitando um campo

```php
// Sempre desabilitado (somente leitura)
Input::create('ID', 'id')->disabled();

// Desabilitado por condição
Input::create('Saldo', 'saldo')
    ->disabled(fn($livewire) => !$livewire->podeEditarSaldo);
```

### Desabilitado em certas operações

```php
// Não pode editar CPF após criação
Input::create('CPF', 'cpf')->disabledOn('update');

// Somente habilitado ao criar
Input::create('Tipo', 'tipo')->enabledOn('create');
```

### Desabilitado baseado em outro campo

```php
// Desabilitado quando tem_desconto está vazio
Input::create('Valor Desconto', 'valor_desconto')
    ->disabledWhenEmpty('form.tem_desconto');

// Desabilitado quando status é 'aprovado'
Input::create('Aprovado Por', 'aprovado_por')
    ->disabledWhen('form.status', 'aprovado');
```

### Protegendo contra desabilitação externa

Quando um campo nunca deve ser desabilitado, independente do estado do formulário:

```php
Input::create('Campo Obrigatório', 'campo')
    ->canBeDisabled(false);
```

---

## Usando closure para acesso ao Livewire

Em qualquer condição que aceita closure, o componente Livewire é injetado automaticamente pelo nome do parâmetro:

```php
Input::create('Campo', 'campo')
    ->hidden(fn($livewire) => $livewire->modoLeitura)
    ->disabled(fn($livewire) => !$livewire->user()->can('editar'));
```

Os parâmetros disponíveis por nome são: `$livewire`, `$operation`.

---

> Veja também: [Estado e Livewire](./component-state) · [Campos de entrada](./form-fields)
