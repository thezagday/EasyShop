<?php

namespace App\Application\Tracking\Command\TrackRoute;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Repository\UserActivityRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class TrackRouteHandler implements CommandHandlerInterface
{
    public function __construct(
        private UserActivityRepositoryInterface $activityRepository,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(TrackRouteCommand $command): void
    {
        $activity = $this->activityRepository->findById($command->id);

        if (!$activity) {
            throw new NotFoundHttpException('Activity not found');
        }

        $activity->setRouteCategories($command->categories);
        $activity->setRouteDistanceMeters($command->distanceMeters);
        $activity->setRouteTimeMinutes($command->timeMinutes);

        $this->entityManager->flush();
    }
}
