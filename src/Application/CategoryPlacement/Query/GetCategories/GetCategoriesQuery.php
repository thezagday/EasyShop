<?php

namespace App\Application\CategoryPlacement\Query\GetCategories;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetCategoriesQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;
}
