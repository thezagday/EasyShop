<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\Tracking\Command\TrackRoute\TrackRouteCommand;
use App\Application\Tracking\Command\TrackSearch\TrackSearchCommand;
use App\Infrastructure\Trait\CommandQueryTrait;
use Fusonic\HttpKernelBundle\Attribute\FromRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/track', name: 'api_track_')]
class TrackingController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('', name: 'search', methods: ['POST'])]
    public function trackSearch(#[FromRequest] TrackSearchCommand $command): JsonResponse
    {
        $activityId = $this->command($command);

        return $this->json(['ok' => true, 'id' => $activityId], Response::HTTP_CREATED);
    }

    #[Route('/{id}/route', name: 'route', methods: ['PATCH'])]
    public function trackRoute(#[FromRequest] TrackRouteCommand $command): JsonResponse
    {
        $this->command($command);

        return $this->json(['ok' => true]);
    }
}
