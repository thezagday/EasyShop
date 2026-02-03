<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\Route\Query\BuildRoute\BuildRouteQuery;
use App\Infrastructure\Attribute\FromRequest;
use App\Infrastructure\Trait\CommandQueryTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class RouteApiController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('/api/build-route/{source}/{destination}', name: 'api_build_route', methods: ['GET'])]
    public function buildRoute(#[FromRequest] BuildRouteQuery $query): JsonResponse
    {
        $route = $this->query($query);

        return $this->json($route);
    }
}