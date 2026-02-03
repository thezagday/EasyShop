<?php

namespace App\Infrastructure\Bus;

use App\Application\Contract\QueryBusInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

class MessengerQueryBus implements QueryBusInterface
{
    public function __construct(
        private MessageBusInterface $queryBus
    ) {
    }

    public function dispatchAndGetResult(object $query): mixed
    {
        $envelope = $this->queryBus->dispatch($query);
        $stamp = $envelope->last(HandledStamp::class);

        return $stamp?->getResult();
    }
}
