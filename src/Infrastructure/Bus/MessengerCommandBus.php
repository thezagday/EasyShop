<?php

namespace App\Infrastructure\Bus;

use App\Application\Contract\CommandBusInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

class MessengerCommandBus implements CommandBusInterface
{
    public function __construct(
        private MessageBusInterface $commandBus
    ) {
    }

    public function dispatchAndGetResult(object $command): mixed
    {
        $envelope = $this->commandBus->dispatch($command);
        $stamp = $envelope->last(HandledStamp::class);

        return $stamp?->getResult();
    }
}
