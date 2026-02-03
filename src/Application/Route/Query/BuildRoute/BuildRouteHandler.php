<?php

namespace App\Application\Route\Query\BuildRoute;

use App\Application\Contract\QueryHandlerInterface;
use App\Domain\Service\RouteService;

final class BuildRouteHandler implements QueryHandlerInterface
{
    public function __construct(
        private RouteService $routeService
    ) {
    }

    public function __invoke(BuildRouteQuery $query): array
    {
        return $this->routeService->getRoute(
            $query->source,
            $query->destination
        );
    }
}
