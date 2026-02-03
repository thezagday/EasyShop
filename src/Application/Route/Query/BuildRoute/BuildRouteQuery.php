<?php

namespace App\Application\Route\Query\BuildRoute;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class BuildRouteQuery implements QueryInterface
{
    #[Assert\NotBlank]
    public string $source;

    #[Assert\NotBlank]
    public string $destination;
}

