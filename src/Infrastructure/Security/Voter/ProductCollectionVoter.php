<?php

namespace App\Infrastructure\Security\Voter;

use App\Domain\Entity\ProductCollection;
use App\Domain\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProductCollectionVoter extends Voter
{
    public const MANAGE = 'PRODUCT_COLLECTION_MANAGE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::MANAGE && $subject instanceof ProductCollection;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var ProductCollection $collection */
        $collection = $subject;

        $owner = $collection->getUser();

        if (!$owner) {
            return false;
        }

        return $owner->getId() === $user->getId();
    }
}
