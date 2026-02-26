<?php

namespace App\Application\Collection\Query\GetCollections;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetCollectionsQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    public ?int $userId = null;
}
