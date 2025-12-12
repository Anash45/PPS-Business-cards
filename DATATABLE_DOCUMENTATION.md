# Custom DataTable Component - Documentation

## Overview

A fully-featured, server-side DataTable component built specifically for Laravel + Inertia.js React applications. This component solves the performance issues of loading large datasets by implementing server-side pagination, search, and sorting.

## Features

✅ **Server-side pagination** - Only loads the data needed for the current page  
✅ **Server-side search** - Search across specified columns  
✅ **Column sorting** - Sort by any column (ascending/descending)  
✅ **Results per page** - User can choose how many rows to display  
✅ **Multiple tables per page** - Use multiple independent tables on one page  
✅ **Customizable columns** - Custom render functions for complex content  
✅ **Loading states** - Built-in loading indicators  
✅ **Fully styled** - Clean, professional design with TailwindCSS  

---

## Quick Start

### 1. Backend Setup (Laravel Controller)

Add the `DataTableTrait` to your controller:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Traits\DataTableTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    use DataTableTrait;

    public function index(Request $request)
    {
        $searchableColumns = ['code', 'first_name', 'last_name', 'email'];
        $sortableColumns = ['id', 'code', 'first_name', 'created_at'];

        $query = Card::query()->where('user_id', auth()->id());

        $cards = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            10 // default per page
        );

        return Inertia::render('Cards/Index', [
            'cards' => $cards,
        ]);
    }
}
```

### 2. Frontend Setup (React Component)

```jsx
import CustomDataTable from '@/Components/CustomDataTable';

export default function CardsIndex({ cards }) {
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
        },
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            render: (code) => (
                <a href={`/card/${code}`} className="text-blue-600">
                    {code}
                </a>
            ),
        },
        {
            key: 'first_name',
            label: 'Name',
            sortable: true,
            render: (firstName, row) => `${firstName} ${row.last_name}`,
        },
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={cards}
            endpoint={route('cards.index')}
            tableKey="cards"
        />
    );
}
```

---

## Props Reference

### CustomDataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array | `[]` | Column definitions (see below) |
| `data` | Object | `{data: [], total: 0, ...}` | Paginated data from Laravel |
| `endpoint` | String | - | Route endpoint for server-side processing |
| `tableKey` | String | `'default'` | Unique key for multiple tables |
| `searchable` | Boolean | `true` | Enable search functionality |
| `paginated` | Boolean | `true` | Enable pagination |
| `perPageOptions` | Array | `[10, 25, 50, 100]` | Options for results per page |
| `additionalFilters` | Object | `{}` | Additional filters to send with requests |
| `onRowClick` | Function | `null` | Callback when row is clicked |
| `emptyMessage` | String | `'No records found'` | Message when no data |
| `className` | String | `''` | Additional CSS classes |

### Column Definition

```javascript
{
    key: 'column_name',           // Database column name
    label: 'Display Name',        // Header label
    sortable: true,               // Enable sorting
    className: 'text-right',      // TD className
    headerClassName: 'bg-blue-50', // TH className
    render: (value, row, index) => { // Custom render function
        return <CustomComponent value={value} />;
    }
}
```

---

## Usage Examples

### Example 1: Basic Table

```jsx
<CustomDataTable
    columns={[
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
    ]}
    data={users}
    endpoint={route('users.index')}
    tableKey="users"
/>
```

### Example 2: Custom Rendered Columns

```jsx
const columns = [
    {
        key: 'avatar',
        label: 'Avatar',
        sortable: false,
        render: (avatar, row) => (
            <img 
                src={avatar || '/default-avatar.png'} 
                alt={row.name}
                className="w-10 h-10 rounded-full"
            />
        ),
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (status) => (
            <span className={`px-2 py-1 rounded ${
                status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {status}
            </span>
        ),
    },
];
```

### Example 3: With Action Buttons

```jsx
const columns = [
    // ... other columns
    {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        className: 'text-right',
        render: (_, row) => (
            <div className="flex justify-end gap-2">
                <button onClick={() => handleEdit(row.id)}>
                    Edit
                </button>
                <button onClick={() => handleDelete(row.id)}>
                    Delete
                </button>
            </div>
        ),
    },
];
```

### Example 4: Multiple Tables on One Page

```jsx
export default function Dashboard({ cards, users }) {
    return (
        <div className="space-y-8">
            {/* Cards Table */}
            <CustomDataTable
                columns={cardColumns}
                data={cards}
                endpoint={route('cards.index')}
                tableKey="cards"
            />

            {/* Users Table */}
            <CustomDataTable
                columns={userColumns}
                data={users}
                endpoint={route('users.index')}
                tableKey="users"
            />
        </div>
    );
}
```

### Example 5: With Additional Filters

```jsx
const [status, setStatus] = useState('');
const [dateFrom, setDateFrom] = useState('');

<CustomDataTable
    columns={columns}
    data={cards}
    endpoint={route('cards.index')}
    tableKey="cards"
    additionalFilters={{
        status: status,
        date_from: dateFrom,
    }}
/>
```

### Example 6: Static Data (No Server-Side Processing)

```jsx
<CustomDataTable
    columns={columns}
    data={{
        data: staticDataArray,
        total: staticDataArray.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    }}
    // Don't provide endpoint for static data
    searchable={false}
    paginated={false}
/>
```

---

## Backend Implementation

### Basic Controller Method

```php
public function index(Request $request)
{
    $query = Card::query();
    
    $cards = $this->applyDataTableFilters(
        $query,
        $request,
        ['code', 'first_name', 'last_name'], // searchable columns
        ['id', 'code', 'created_at'],         // sortable columns
        10                                     // default per page
    );

    return Inertia::render('Cards/Index', ['cards' => $cards]);
}
```

### With Relationships

```php
public function index(Request $request)
{
    $query = Card::query()
        ->with(['company', 'user']); // Eager load relationships
    
    $searchableColumns = [
        'code',
        'first_name',
        'company.name',  // Search in related table
        'user.email',
    ];

    $cards = $this->applyDataTableFilters(
        $query,
        $request,
        $searchableColumns,
        ['id', 'code', 'created_at'],
        10
    );

    return Inertia::render('Cards/Index', ['cards' => $cards]);
}
```

### With Additional Filters

```php
public function index(Request $request)
{
    $query = Card::query();

    // Apply custom filters first
    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    if ($request->filled('company_id')) {
        $query->where('company_id', $request->company_id);
    }

    // Then apply DataTable filters
    $cards = $this->applyDataTableFilters(
        $query,
        $request,
        ['code', 'first_name'],
        ['id', 'created_at'],
        25
    );

    return Inertia::render('Cards/Index', ['cards' => $cards]);
}
```

### Separate Endpoints for Multiple Tables

```php
// Route 1: Cards
public function getCards(Request $request)
{
    $query = Card::query();
    $cards = $this->applyDataTableFilters($query, $request, [...], [...], 10);
    
    return Inertia::render('Dashboard', ['cards' => $cards]);
}

// Route 2: Users
public function getUsers(Request $request)
{
    $query = User::query();
    $users = $this->applyDataTableFilters($query, $request, [...], [...], 10);
    
    return Inertia::render('Dashboard', ['users' => $users]);
}
```

---

## Advanced Features

### Row Click Handler

```jsx
<CustomDataTable
    columns={columns}
    data={cards}
    endpoint={route('cards.index')}
    onRowClick={(row) => {
        console.log('Clicked row:', row);
        router.visit(`/cards/${row.id}`);
    }}
/>
```

### Custom Loading State

The component has built-in loading states. During data fetching, it displays a spinner automatically.

### Debounced Search

Search input is automatically debounced (500ms) to avoid excessive server requests while typing.

---

## Performance Tips

1. **Use `with()` for relationships** - Eager load to avoid N+1 queries
2. **Index searchable columns** - Add database indexes for better search performance
3. **Limit searchable columns** - Only make necessary columns searchable
4. **Use `select()` to limit fields** - Only fetch needed columns
5. **Cache static data** - Cache dropdown options and reference data

### Example with Optimization

```php
public function index(Request $request)
{
    $query = Card::query()
        ->select(['id', 'code', 'first_name', 'last_name', 'created_at']) // Only needed fields
        ->with(['company:id,name']) // Only needed relationship fields
        ->where('user_id', auth()->id());

    $cards = $this->applyDataTableFilters(
        $query,
        $request,
        ['code', 'first_name'],
        ['id', 'created_at'],
        25
    );

    return Inertia::render('Cards/Index', ['cards' => $cards]);
}
```

---

## Styling Customization

The component uses TailwindCSS. You can customize by:

1. **Override styles with className prop**
2. **Modify the component CSS classes directly**
3. **Add custom classes to column definitions**

```jsx
<CustomDataTable
    className="custom-table-styles"
    columns={[
        {
            key: 'name',
            label: 'Name',
            className: 'font-bold text-blue-600',
            headerClassName: 'bg-blue-100',
        },
    ]}
    // ...
/>
```

---

## Troubleshooting

### Data not updating
- Ensure `tableKey` matches the prop name in your Inertia render
- Check that `endpoint` is correct
- Verify route exists: `route('cards.index')` in your routes file

### Multiple tables interfering
- Each table needs a unique `tableKey`
- Use separate endpoints for each table

### Search not working
- Verify columns are in `$searchableColumns` array in controller
- Check database column names match

### Sorting not working
- Verify columns are in `$sortableColumns` array in controller
- For relationship sorting, use dot notation: `company.name`

---

## Migration Guide

### From datatables.net-react

**Before:**
```jsx
import DataTable from "datatables.net-react";

<DataTable data={allCards} columns={columns} />
```

**After:**
```jsx
import CustomDataTable from "@/Components/CustomDataTable";

<CustomDataTable 
    data={paginatedCards} 
    columns={columns}
    endpoint={route('cards.index')}
    tableKey="cards"
/>
```

**Controller changes:**
```php
// Before: Returning all records
return Inertia::render('Cards/Index', [
    'cards' => Card::all()
]);

// After: Using pagination
use App\Traits\DataTableTrait;

public function index(Request $request)
{
    $query = Card::query();
    $cards = $this->applyDataTableFilters(
        $query, $request, 
        ['first_name', 'last_name'], 
        ['id', 'created_at'], 
        10
    );
    
    return Inertia::render('Cards/Index', ['cards' => $cards]);
}
```

---

## Complete Working Example

See [resources/js/Pages/Examples/CustomDataTableExample.jsx](../Pages/Examples/CustomDataTableExample.jsx) for a complete working example with multiple tables and all features demonstrated.

---

## Support

For issues or questions, check:
- Component code: `resources/js/Components/CustomDataTable.jsx`
- Trait code: `app/Traits/DataTableTrait.php`
- Example: `resources/js/Pages/Examples/CustomDataTableExample.jsx`
- Example Controller: `app/Http/Controllers/Examples/DataTableExampleController.php`
