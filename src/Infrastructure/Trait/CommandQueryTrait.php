<?php

namespace App\Infrastructure\Trait;

use App\Application\Contract\CommandBusInterface;
use App\Application\Contract\QueryBusInterface;
use Symfony\Contracts\Service\Attribute\Required;

trait CommandQueryTrait
{
    protected CommandBusInterface $commandBus;
    protected QueryBusInterface $queryBus;

    #[Required]
    public function setBuses(CommandBusInterface $commandBus, QueryBusInterface $queryBus): void
    {
        $this->commandBus = $commandBus;
        $this->queryBus = $queryBus;
    }

    protected function command(object $command): mixed
    {
        return $this->commandBus->dispatchAndGetResult($command);
    }

    protected function query(object $query): mixed
    {
        return $this->queryBus->dispatchAndGetResult($query);
    }
}
