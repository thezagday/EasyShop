<?php

namespace App\Domain\Repository;

use App\Domain\Entity\ShopCategory;

interface ShopCategoryRepositoryInterface
{
    public function findById(int $id): ?ShopCategory;
    public function save(ShopCategory $shopCategory, bool $flush = false): void;
    public function remove(ShopCategory $shopCategory, bool $flush = false): void;
}
