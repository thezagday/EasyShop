<?php

namespace App\Application\Contract;

interface QueryBusInterface
{
    public function dispatchAndGetResult(object $query): mixed;
}
