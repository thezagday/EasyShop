<?php

namespace App\Application\Contract;

interface CommandBusInterface
{
    public function dispatchAndGetResult(object $command): mixed;
}
