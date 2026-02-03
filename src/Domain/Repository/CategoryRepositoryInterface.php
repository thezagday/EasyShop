<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Category;

interface CategoryRepositoryInterface
{
    public function findById(int $id): ?Category;
    /** @return Category[] */
    public function findAll();
    public function save(Category $category, bool $flush = false): void;
    public function remove(Category $category, bool $flush = false): void;
}
