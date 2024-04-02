<?php

namespace App\Controller;

use App\Services\RouteService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class RouteApiController extends AbstractController
{
    public function __construct(
        protected RouteService $routeService
    ) {
    }

    #[Route('/api/build-route')]
    public function buildRoute(): Response
    {
        return $this->json($this->routeService->getRoute());
    }
}