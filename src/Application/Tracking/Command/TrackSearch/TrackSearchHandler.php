<?php

namespace App\Application\Tracking\Command\TrackSearch;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Factory\UserActivityFactory;
use App\Domain\Repository\ShopRepositoryInterface;
use App\Domain\Repository\UserActivityRepositoryInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class TrackSearchHandler implements CommandHandlerInterface
{
    public function __construct(
        private ShopRepositoryInterface $shopRepository,
        private UserActivityRepositoryInterface $activityRepository,
        private UserActivityFactory $activityFactory,
        private Security $security
    ) {
    }

    public function __invoke(TrackSearchCommand $command): int
    {
        $shop = $this->shopRepository->findById($command->shopId);

        if (!$shop) {
            throw new NotFoundHttpException('Shop not found');
        }

        $user = $this->security->getUser();

        $activity = $this->activityFactory->createFromSearchCommand($command, $shop, $user);

        $this->activityRepository->save($activity, true);

        return $activity->getId();
    }
}
