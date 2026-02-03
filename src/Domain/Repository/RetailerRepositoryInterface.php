<?php

namespace App\Domain\Repository;

use App\Domain\Entity\Retailer;

interface RetailerRepositoryInterface
{
    public function findById(int $id): ?Retailer;
    public function save(Retailer $retailer, bool $flush = false): void;
    public function remove(Retailer $retailer, bool $flush = false): void;
}
