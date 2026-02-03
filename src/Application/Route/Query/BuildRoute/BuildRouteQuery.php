<?php

namespace App\Application\Route\Query\BuildRoute;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class BuildRouteQuery implements QueryInterface
{
    public function __construct(
        #[Assert\NotBlank]
        private readonly string $source,

        #[Assert\NotBlank]
        private readonly string $destination,
    ) {
    }

    public function getSource(): string
    {
        return $this->source;
    }

    public function getDestination(): string
    {
        return $this->destination;
    }
}
