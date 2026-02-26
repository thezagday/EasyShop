<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Domain\Entity\ProductCollection;
use App\Infrastructure\Security\Voter\ProductCollectionVoter;
use App\Domain\Repository\ShopRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user/collections', name: 'api_user_collections_')]
#[IsGranted('ROLE_USER')]
class UserCollectionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ShopRepositoryInterface $shopRepository
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $shopId = $request->query->get('shopId');

        $collections = $user->getCollections();
        if ($shopId) {
            $collections = $collections->filter(function ($collection) use ($shopId) {
                return $collection->getShop()->getId() === (int) $shopId;
            });
        }

        $result = [];
        foreach ($collections as $collection) {
            $commodities = [];
            foreach ($collection->getCommodities() as $commodity) {
                $commodities[] = [
                    'id' => $commodity->getId(),
                    'title' => $commodity->getTitle(),
                ];
            }

            $result[] = [
                'id' => $collection->getId(),
                'title' => $collection->getTitle(),
                'description' => $collection->getDescription(),
                'emoji' => $collection->getEmoji(),
                'active' => $collection->isActive(),
                'shopId' => $collection->getShop()->getId(),
                'commodities' => $commodities,
                'commodityCount' => count($commodities),
            ];
        }

        return $this->json([
            'collections' => $result,
            'total' => count($result),
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        $shopId = $data['shopId'] ?? null;
        if (!$shopId) {
            return $this->json(['error' => 'shopId is required'], 400);
        }

        $shop = $this->shopRepository->findById((int) $shopId);
        if (!$shop) {
            return $this->json(['error' => 'Shop not found'], 404);
        }

        $collection = new ProductCollection();
        $collection->setUser($user);
        $collection->setShop($shop);
        $collection->setTitle($data['title'] ?? 'Новая подборка');
        $collection->setDescription($data['description'] ?? null);
        $collection->setEmoji($data['emoji'] ?? null);
        $collection->setActive($data['active'] ?? true);
        $collection->setSortOrder($data['sortOrder'] ?? 0);

        $this->entityManager->persist($collection);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'collection' => [
                'id' => $collection->getId(),
                'title' => $collection->getTitle(),
                'description' => $collection->getDescription(),
                'emoji' => $collection->getEmoji(),
                'active' => $collection->isActive(),
                'shopId' => $collection->getShop()->getId(),
            ],
        ], 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $collection = $this->entityManager->getRepository(ProductCollection::class)->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $this->denyAccessUnlessGranted(ProductCollectionVoter::MANAGE, $collection);

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $collection->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $collection->setDescription($data['description']);
        }
        if (isset($data['emoji'])) {
            $collection->setEmoji($data['emoji']);
        }
        if (isset($data['active'])) {
            $collection->setActive((bool) $data['active']);
        }
        if (isset($data['sortOrder'])) {
            $collection->setSortOrder((int) $data['sortOrder']);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'collection' => [
                'id' => $collection->getId(),
                'title' => $collection->getTitle(),
                'description' => $collection->getDescription(),
                'emoji' => $collection->getEmoji(),
                'active' => $collection->isActive(),
            ],
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $collection = $this->entityManager->getRepository(ProductCollection::class)->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $this->denyAccessUnlessGranted(ProductCollectionVoter::MANAGE, $collection);

        $this->entityManager->remove($collection);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/commodities', name: 'add_commodity', methods: ['POST'])]
    public function addCommodity(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $collection = $this->entityManager->getRepository(ProductCollection::class)->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $this->denyAccessUnlessGranted(ProductCollectionVoter::MANAGE, $collection);

        $data = json_decode($request->getContent(), true);
        $commodityId = $data['commodityId'] ?? null;

        if (!$commodityId) {
            return $this->json(['error' => 'commodityId is required'], 400);
        }

        $commodity = $this->entityManager->getRepository(\App\Domain\Entity\Commodity::class)->find($commodityId);
        if (!$commodity) {
            return $this->json(['error' => 'Commodity not found'], 404);
        }

        $collection->addCommodity($commodity);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/commodities/{commodityId}', name: 'remove_commodity', methods: ['DELETE'])]
    public function removeCommodity(int $id, int $commodityId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $collection = $this->entityManager->getRepository(ProductCollection::class)->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $this->denyAccessUnlessGranted(ProductCollectionVoter::MANAGE, $collection);

        $commodity = $this->entityManager->getRepository(\App\Domain\Entity\Commodity::class)->find($commodityId);
        if (!$commodity) {
            return $this->json(['error' => 'Commodity not found'], 404);
        }

        $collection->removeCommodity($commodity);
        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }
}
