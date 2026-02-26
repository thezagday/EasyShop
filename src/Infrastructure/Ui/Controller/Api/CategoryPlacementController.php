<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\CategoryPlacement\Command\UpdateCategoryCoordinates\UpdateCategoryCoordinatesCommand;
use App\Application\CategoryPlacement\Command\UpdateEntranceExit\UpdateEntranceExitCommand;
use App\Application\CategoryPlacement\Query\GetCategories\GetCategoriesQuery;
use App\Application\CategoryPlacement\Query\GetEntranceExit\GetEntranceExitQuery;
use App\Infrastructure\Trait\CommandQueryTrait;
use Fusonic\HttpKernelBundle\Attribute\FromRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/shops/{shopId}', name: 'api_placement_')]
class CategoryPlacementController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('/categories', name: 'categories_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listCategories(#[FromRequest] GetCategoriesQuery $query): JsonResponse
    {
        $data = $this->query($query);

        return $this->json($data);
    }

    #[Route('/categories/{id}/coordinates', name: 'category_update_coords', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateCategoryCoordinates(#[FromRequest] UpdateCategoryCoordinatesCommand $command): JsonResponse
    {
        $result = $this->command($command);

        return $this->json($result);
    }

    #[Route('/entrance-exit', name: 'entrance_exit_get', methods: ['GET'])]
    public function getEntranceExit(#[FromRequest] GetEntranceExitQuery $query): JsonResponse
    {
        $data = $this->query($query);

        return $this->json($data);
    }

    #[Route('/entrance-exit', name: 'entrance_exit_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateEntranceExit(#[FromRequest] UpdateEntranceExitCommand $command): JsonResponse
    {
        $result = $this->command($command);

        return $this->json($result);
    }
}
