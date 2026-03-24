# Framework — Documentação para Desenvolvedores

Este é o módulo central (`app-modules/framework`) que fornece a infraestrutura base para todos os outros módulos do sistema. Ele contém o sistema de Resources (CRUD), componentes de formulário, utilitários de roteamento, filtros para DataTable, concerns Livewire e a estrutura de Sidebar.

---

## Índice

- [Resource e Pages](./Resource.md) ← **comece aqui**
  - [AbstractResource](./Resource.md#abstractresource)
  - [AbstractListPage](./Resource.md#abstractlistpage)
  - [AbstractCreatePage](./Resource.md#abstractcreatepage)
  - [AbstractEditPage](./Resource.md#abstracteditpage)
  - [AbstractViewPage](./Resource.md#abstractviewpage)
  - [ManagePage](./Resource.md#managepage)
  - [AbstractReportPage](./Resource.md#abstractreportpage)
  - [AbstractBaseComponent](./Resource.md#abstractbasecomponent)
- [Componentes de Entrada (campos)](./FormComponents.md)
  - [Input](./FormComponents.md#input)
  - [Select](./FormComponents.md#select)
  - [SimpleSelect](./FormComponents.md#simpleselect)
  - [Textarea](./FormComponents.md#textarea)
  - [Checkbox](./FormComponents.md#checkbox)
  - [Toggle](./FormComponents.md#toggle)
  - [Form](./FormComponents.md#form)
  - [Container](./FormComponents.md#container)
  - [Tabs](./FormComponents.md#tabs)
  - [Modal](./FormComponents.md#modal)
  - [Table (inline)](./FormComponents.md#table)
  - [CreateAction / EditTableAction / DeleteTableAction / ViewTableAction](./FormComponents.md#ações-de-tabela)
  - [AbstractResourceRequest](./FormComponents.md#abstractresourcerequest)
  - [BaseService](./FormComponents.md#baseservice)
  - [BaseResponder](./FormComponents.md#baseresponder)
  - [FilterOperator](./FormComponents.md#filteroperator-enum)
  - [ResourceFilter](./FormComponents.md#resourcefilter)
- [Componentes de Formulário do Framework](./Components.md)
  - [Repeater](./Components.md#repeater)
  - [SimpleRepeater](./Components.md#simplerepeater)
  - [RepeaterContainer](./RepeaterContainer.md)
  - [CollapsibleGroup](./Components.md#collapsiblegroup)
  - [FileUpload](./Components.md#fileupload)
  - [DateRange](./Components.md#daterange)
  - [Money](./Components.md#money)
  - [Text](./Components.md#text)
  - [ProgressBar](./Components.md#progressbar)
  - [ModalConfirm](./Components.md#modalconfirm)
- [Concerns dos Componentes (Traits)](./ComponentConcerns.md)
  - [CanBeHidden](./ComponentConcerns.md#canbehidden)
  - [CanBeDisabled](./ComponentConcerns.md#canbedisabled)
  - [HasState](./ComponentConcerns.md#hasstate)
  - [HasWire](./ComponentConcerns.md#haswire)
  - [HasChildComponents](./ComponentConcerns.md#haschildcomponents)
  - [HasRecord](./ComponentConcerns.md#hasrecord)
  - [HasInputBehavior](./ComponentConcerns.md#hasinputbehavior)
  - [CanBeFilter](./ComponentConcerns.md#canbefilter)
- [Concerns Livewire (Pages)](./LivewireConcerns.md)
  - [IsPage](./LivewireConcerns.md#ispage)
  - [CanSubmit](./LivewireConcerns.md#cansubmit)
  - [CanFillForm](./LivewireConcerns.md#canfillform)
  - [CanManipulateModal](./LivewireConcerns.md#canmanipulatemodal)
  - [InteractWithForms](./LivewireConcerns.md#interactwithforms)
  - [InteractsWithRecord](./LivewireConcerns.md#interactswithrecord)
  - [HandlesFileUploadAttachments](./LivewireConcerns.md#handlesfileuploadattachments)
  - [HasBulkActions](./LivewireConcerns.md#hasbulkactions)
  - [WithRules](./LivewireConcerns.md#withrules)
  - [HasConfig](./LivewireConcerns.md#hasconfig)
  - [HasOperation](./LivewireConcerns.md#hasoperation)
- [DataTable — Filtros](./DataTableFilters.md)
  - [FilterAppender](./DataTableFilters.md#filterappender)
  - [LikeFilter / EqualFilter / BooleanFilter / BetweenFilter / JsonFilter](./DataTableFilters.md#likefilter)
- [Sidebar](./Sidebar.md)
  - [SidebarItem](./Sidebar.md#sidebaritem)
  - [SidebarRegistrar](./Sidebar.md#sidebarregistrar)
- [Utilitários](./Utils.md)
  - [TenantRoute](./Utils.md#tenantroute)
  - [ApiTenantRoute](./Utils.md#apitenantrroute)
  - [Number](./Utils.md#number)
  - [BaseRepository](./Utils.md#baserepository)
  - [Breadcrumb](./Utils.md#breadcrumb)
  - [ResourceRegistrar](./Utils.md#resourceregistrar)

---

## Fluxo CRUD típico

Um módulo CRUD completo é composto por:

```
Resource.php          — centro de configuração (model, pages, form, filtros, colunas)
├── ListPage.php      — listagem com DataTable e filtros
├── CreatePage.php    — formulário de criação
├── EditPage.php      — formulário de edição
└── ViewPage.php      — visualização somente leitura (opcional)

Request.php           — regras de validação (opcional, mas recomendado)
Service.php           — lógica de negócio (opcional)
SidebarItem.php       — item no menu lateral
```

Para CRUDs simples (sem página dedicada de edição), use [`ManagePage`](./Resource.md#managepage) que combina lista + modal.

---

## Estrutura de Diretórios

```
app-modules/framework/
├── docs/                          # Esta documentação
├── resources/views/components/    # Blade templates dos componentes do framework
├── src/
│   ├── Common/                    # Breadcrumb, PageRegistration, ResourceRegistrar
│   ├── Components/                # Componentes do framework (Repeater, FileUpload, etc.)
│   │   └── Concerns/              # Traits dos componentes
│   ├── Concerns/                  # Traits para Livewire pages
│   ├── DataTable/                 # Sistema de filtros para tabelas
│   │   └── Filters/
│   ├── DTOs/
│   ├── Exceptions/
│   ├── Mappers/
│   ├── Pages/
│   ├── Providers/
│   ├── Repositories/
│   ├── Sidebar/
│   └── Utils/
└── tests/

app/Livewire/Resources/
├── Components/                    # Input, Select, Modal, Table, Actions
│   └── Forms/                     # Input, Select, SimpleSelect, Textarea, Checkbox, Toggle
└── Entities/
    ├── AbstractResource.php       # Classe base de todos os Resources
    ├── BaseService.php
    ├── Common/                    # FilterOperator, ResourceFilter, ModalConfig, BaseResponder
    ├── DataTableSettings.php
    └── Forms/                     # ComponentContainer, Form, Container, Tabs, AbstractResourceRequest
    └── Pages/                     # AbstractListPage, AbstractCreatePage, AbstractEditPage, etc.
```
