<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Domain\Repository\UserRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user', name: 'api_user_')]
class UserProfileController extends AbstractController
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    #[Route('/context', name: 'get_context', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getContext(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        return $this->json([
            'userContext' => $user->getUserContext(),
        ]);
    }

    #[Route('/context', name: 'update_context', methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function updateContext(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $userContext = $data['userContext'] ?? null;

        $user->setUserContext($userContext);
        $this->userRepository->save($user, true);

        return $this->json([
            'success' => true,
            'userContext' => $user->getUserContext(),
        ]);
    }

    #[Route('/history', name: 'history', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getHistory(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $shopId = $request->query->get('shopId');
        $limit = min((int) $request->query->get('limit', 50), 100);

        $activities = $user->getActivities()
            ->filter(function ($activity) use ($shopId) {
                if (!$shopId) {
                    return true;
                }
                return $activity->getShop()->getId() === (int) $shopId;
            });

        // Convert to array and sort by newest first
        $activitiesArray = $activities->toArray();
        usort($activitiesArray, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });
        $activitiesArray = array_slice($activitiesArray, 0, $limit);

        $history = [];
        foreach ($activitiesArray as $activity) {
            $history[] = [
                'id' => $activity->getId(),
                'query' => $activity->getQuery(),
                'shopId' => $activity->getShop()->getId(),
                'shopTitle' => $activity->getShop()->getTitle(),
                'routeCategories' => $activity->getRouteCategories(),
                'routeDistance' => $activity->getRouteDistanceMeters(),
                'routeTime' => $activity->getRouteTimeMinutes(),
                'routeCost' => $activity->getRouteCost(),
                'purchasedItems' => $activity->getPurchasedItems(),
                'createdAt' => $activity->getCreatedAt()->format('c'),
            ];
        }

        return $this->json([
            'history' => $history,
            'total' => count($history),
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getStats(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $shopId = $request->query->get('shopId');

        $activities = $user->getActivities();
        if ($shopId) {
            $activities = $activities->filter(function ($activity) use ($shopId) {
                return $activity->getShop()->getId() === (int) $shopId;
            });
        }

        $totalRoutes = 0;
        $totalDistance = 0;
        $totalTime = 0;
        $totalCost = 0.0;

        foreach ($activities as $activity) {
            if ($activity->hasRoute()) {
                $totalRoutes++;
                $totalDistance += $activity->getRouteDistanceMeters() ?? 0;
                $totalTime += $activity->getRouteTimeMinutes() ?? 0;
                $cost = $activity->getRouteCost();
                if ($cost) {
                    $totalCost += (float) $cost;
                }
            }
        }

        return $this->json([
            'totalRoutes' => $totalRoutes,
            'totalDistanceMeters' => $totalDistance,
            'totalTimeMinutes' => $totalTime,
            'totalCost' => number_format($totalCost, 2, '.', ''),
            'averageDistanceMeters' => $totalRoutes > 0 ? round($totalDistance / $totalRoutes) : 0,
            'averageTimeMinutes' => $totalRoutes > 0 ? round($totalTime / $totalRoutes) : 0,
            'averageCost' => $totalRoutes > 0 ? number_format($totalCost / $totalRoutes, 2, '.', '') : '0.00',
        ]);
    }
}
