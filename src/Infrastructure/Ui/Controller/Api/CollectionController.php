<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\Collection\Query\GetCollections\GetCollectionsQuery;
use App\Infrastructure\Trait\CommandQueryTrait;
use Fusonic\HttpKernelBundle\Attribute\FromRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/shops/{shopId}/collections', name: 'api_collection_')]
class CollectionController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[FromRequest] GetCollectionsQuery $query): JsonResponse
    {
        $collections = $this->query($query);

        return $this->json($collections);
    }
}
