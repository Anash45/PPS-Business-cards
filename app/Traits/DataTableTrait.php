<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait DataTableTrait
{
    /**
     * Apply DataTable filters, search, sorting, and pagination to a query
     *
     * @param Builder $query The Eloquent query builder
     * @param Request $request The incoming request
     * @param array $searchableColumns Columns that can be searched
     * @param array $sortableColumns Columns that can be sorted
     * @param int $defaultPerPage Default number of items per page
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function applyDataTableFilters(
        Builder $query,
        Request $request,
        array $searchableColumns = [],
        array $sortableColumns = [],
        int $defaultPerPage = 10
    ) {
        // Apply search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchableColumns, $searchTerm) {
                foreach ($searchableColumns as $column) {
                    // Handle dot notation for relationships (e.g., 'user.name')
                    if (str_contains($column, '.')) {
                        [$relation, $field] = explode('.', $column, 2);
                        $q->orWhereHas($relation, function ($query) use ($field, $searchTerm) {
                            $query->where($field, 'like', "%{$searchTerm}%");
                        });
                    } else {
                        $q->orWhere($column, 'like', "%{$searchTerm}%");
                    }
                }
            });
        }

        // Apply sorting
        if ($request->has('sort_by') && !empty($request->sort_by)) {
            $sortBy = $request->sort_by;
            $sortDirection = $request->input('sort_direction', 'asc');

            // Validate sort direction
            if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }

            // Check if column is sortable
            if (in_array($sortBy, $sortableColumns)) {
                // Handle dot notation for relationships
                if (str_contains($sortBy, '.')) {
                        [$relation, $field] = explode('.', $sortBy, 2);
                        // Only supports belongsTo for now
                        $relationMethod = $relation;
                        $model = $query->getModel();
                        if (method_exists($model, $relationMethod)) {
                            $relationObj = $model->$relationMethod();
                            $relatedTable = $relationObj->getRelated()->getTable();
                            $foreignKey = $relationObj->getForeignKeyName();
                            $ownerKey = $relationObj->getOwnerKeyName();
                            // Join related table
                            $query->leftJoin($relatedTable, $model->getTable() . '.' . $foreignKey, '=', $relatedTable . '.' . $ownerKey);
                            $query->orderBy($relatedTable . '.' . $field, $sortDirection);
                            // Avoid duplicate results
                            $query->select($model->getTable() . '.*');
                        } else {
                            // Fallback: do not sort if relation not found
                        }
                } else {
                    $query->orderBy($sortBy, $sortDirection);
                }
            }
        }

        // Get per_page from request or use default
        $perPage = $request->input('per_page', $defaultPerPage);
        
        // Validate per_page is numeric and within reasonable limits
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 1000) {
            $perPage = $defaultPerPage;
        }

        // Apply pagination
        return $query->paginate($perPage);
    }

    /**
     * Apply DataTable filters and return JSON response (for API endpoints)
     *
     * @param Builder $query The Eloquent query builder
     * @param Request $request The incoming request
     * @param array $searchableColumns Columns that can be searched
     * @param array $sortableColumns Columns that can be sorted
     * @param int $defaultPerPage Default number of items per page
     * @return \Illuminate\Http\JsonResponse
     */
    public function dataTableResponse(
        Builder $query,
        Request $request,
        array $searchableColumns = [],
        array $sortableColumns = [],
        int $defaultPerPage = 10
    ) {
        $data = $this->applyDataTableFilters(
            $query,
            $request,
            $searchableColumns,
            $sortableColumns,
            $defaultPerPage
        );

        return response()->json($data);
    }
}
