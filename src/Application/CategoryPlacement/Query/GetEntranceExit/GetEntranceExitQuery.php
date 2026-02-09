<?php

namespace App\Application\CategoryPlacement\Query\GetEntranceExit;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetEntranceExitQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;
}
