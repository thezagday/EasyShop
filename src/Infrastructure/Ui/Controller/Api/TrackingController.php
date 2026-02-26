<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\Tracking\Command\TrackRoute\TrackRouteCommand;
use App\Application\Tracking\Command\TrackSearch\TrackSearchCommand;
use App\Infrastructure\Trait\CommandQueryTrait;
use Fusonic\HttpKernelBundle\Attribute\FromRequest;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[Route('/api/track', name: 'api_track_')]
class TrackingController extends AbstractController
{
    use CommandQueryTrait;

    public function __construct(
        #[Autowire(service: 'limiter.tracking_public')]
        private readonly RateLimiterFactory $trackingLimiter,
    ) {
    }

    #[Route('', name: 'search', methods: ['POST'])]
    public function trackSearch(Request $request, #[FromRequest] TrackSearchCommand $command): JsonResponse
    {
        if ($rateLimitedResponse = $this->createRateLimitedResponse($request, 'track:search')) {
            return $rateLimitedResponse;
        }

        $activityId = $this->command($command);

        return $this->json(['ok' => true, 'id' => $activityId], Response::HTTP_CREATED);
    }

    #[Route('/{id}/route', name: 'route', methods: ['PATCH'])]
    public function trackRoute(Request $request, #[FromRequest] TrackRouteCommand $command): JsonResponse
    {
        if ($rateLimitedResponse = $this->createRateLimitedResponse($request, 'track:route')) {
            return $rateLimitedResponse;
        }

        $this->command($command);

        return $this->json(['ok' => true]);
    }

    private function createRateLimitedResponse(Request $request, string $scope): ?JsonResponse
    {
        $identity = $this->getUser()?->getUserIdentifier() ?? ($request->getClientIp() ?? 'anonymous');
        $limit = $this->trackingLimiter->create($scope . ':' . $identity)->consume(1);

        if ($limit->isAccepted()) {
            return null;
        }

        $retryAfter = $limit->getRetryAfter();
        $headers = [];
        if ($retryAfter !== null) {
            $headers['Retry-After'] = (string) max(1, $retryAfter->getTimestamp() - time());
        }

        return $this->json([
            'error' => 'Too many tracking requests. Please retry later.',
        ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
    }
}
