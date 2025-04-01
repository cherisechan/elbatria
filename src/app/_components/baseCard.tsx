interface CardProp {
    name: string,
    id:string,
}
export default function BaseCard({name, id}:CardProp) {
    return (
        <div className="border-solid w-10 h-10 text-black">
            {name}
        </div>
    )
}