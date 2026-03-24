
# Framework

O framework é a base de todos os módulos do sistema. Ele define a forma como um CRUD é estruturado, como os formulários são compostos, como filtros funcionam e como o menu lateral é montado.

Esta documentação segue o mesmo espírito do nosso [guia de boas práticas](https://sagatechdev.github.io/best-practices/): orientação, não imposição. Quando houver uma forma estabelecida pelo framework de fazer algo, siga-a. Quando precisar de algo fora do padrão, entenda o que está fazendo e justifique.

**Bom desenvolvimento!** 🚀

---

## Por onde começar

Se você está criando um novo módulo CRUD, comece pelo [Resource e Pages](./resource). Ele explica como montar a estrutura completa de listagem, criação, edição e visualização.

Se precisar entender um campo ou componente específico, acesse diretamente a seção correspondente abaixo.

---

## Tópicos

### Estrutura CRUD
- [Resource e Pages](./resource) — o centro de um módulo CRUD: model, rotas, permissões, colunas e formulários

### Campos de Formulário
- [Campos de entrada](./form-fields) — Input, Select, SimpleSelect, Textarea, Checkbox, Toggle
- [Componentes estruturais](./form-structure) — Form, Container, Tabs, Modal, Table inline

### Componentes do Framework
- [Repeater e variações](./repeater) — Repeater, SimpleRepeater, RepeaterContainer
- [Outros componentes](./components) — CollapsibleGroup, FileUpload, DateRange, Money, Text, ProgressBar, ModalConfirm

### Comportamentos dos Componentes
- [Visibilidade e desabilitação](./component-behavior) — hidden, visible, disabled e suas variações condicionais
- [Estado e Livewire](./component-state) — default, statePath, wire:model, live, onBlur, onEnter

### Livewire Pages
- [Submissão de formulário](./livewire-submit) — CanSubmit, CanFillForm, mutateFormDataBeforeFill
- [Modais e registros](./livewire-modal-record) — CanManipulateModal, InteractsWithRecord
- [Upload de arquivos](./livewire-uploads) — HandlesFileUploadAttachments
- [Outros concerns](./livewire-others) — InteractWithForms, HasBulkActions, WithRules, HasConfig, HasOperation, IsPage

### DataTable
- [Filtros](./datatable-filters) — LikeFilter, EqualFilter, BooleanFilter, BetweenFilter, JsonFilter, FilterAppender

### Sidebar
- [Menu lateral](./sidebar) — SidebarItem, SidebarSeparator, SidebarRegistrar

### Utilitários
- [Utilitários gerais](./utils) — TenantRoute, ApiTenantRoute, Number, BaseRepository, Breadcrumb, ResourceRegistrar

---

## Estrutura de diretórios

```
app-modules/framework/src/     — código do framework
app/Livewire/Resources/        — classes base (Resource, Pages, componentes de campo)
app-modules/framework/docs/    — esta documentação
```

---

> Encontrou algo errado ou desatualizado? Abra uma issue ou atualize diretamente o arquivo `.md` correspondente em `app-modules/framework/docs/`.
